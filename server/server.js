// --- IMPORTS ---
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pg = require('pg');
const path = require('path');
const passport = require('./passport-config');
require('dotenv').config({ path: 'server/.env' });

// --- CONSTANTS ---
const app = express();
const port = process.env.PORT || 5001;
const wordApiServer = "https://random-word-api.herokuapp.com";
const meaningApiServer = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../build')));


// --- ROUTE HANDLERS ---
app.get('/api/word', async (req, res) => {
  try {
    const response = await axios.get(`${wordApiServer}/word?length=${Math.floor((Math.random()*8) + 5)}`);
    const word = response.data[0];
    console.log(word);
    res.json({ word });
  } catch (error) {
    console.error('Error fetching word:', error.message);
    res.status(500).json({ error: 'Error fetching word from the API' });
  }
});

app.get('/api/word/:word/meaning', async (req, res) => {
  const { word } = req.params;
  try {
    const response = await axios.get(meaningApiServer + word.toLowerCase());
    const meanings = response.data[0]?.meanings;
    if (meanings && meanings.length > 0) {
      res.json({ meanings });
    } else {
      res.status(404).json({ error: 'Meaning not found for the word.' });
    }
  } catch (error) {
    console.error('Error fetching word meaning:', error.message);
    res.status(500).json({ error: 'Error fetching word meaning from the API' });
  }
});


// Register User
app.post('/api/user/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const userExistsQuery = 'SELECT * FROM users WHERE username = $1';
    const userExistsResult = await pool.query(userExistsQuery, [username]);

    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertUserQuery = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    const insertedUser = await pool.query(insertUserQuery, [username, hashedPassword]);

    // Authenticate the user after registration
    req.login(insertedUser.rows[0], (err) => {
      if (err) {
        console.error('Error logging in after registration:', err);
        return res.status(500).json({ error: 'Error logging in after registration' });
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ error: 'Error registering user' });
  }
});


// User login
app.post(
  '/api/user/login',
  passport.authenticate('local'),
  (req, res) => {
    res.redirect('/');
  }
);

// User login
app.post('/api/user/logout', (req, res) => {
  req.logout(() => {
  });
  res.redirect("/")
});

// Fetch leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboardQuery = 'SELECT * FROM leaderboard ORDER BY score DESC';
    const leaderboardResult = await pool.query(leaderboardQuery);

    res.status(200).json(leaderboardResult.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

app.get('/api/leaderboard/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const userScoreQuery = 'SELECT score, google_name, username FROM leaderboard WHERE username = $1';
    const userScoreResult = await pool.query(userScoreQuery, [username]);

    if (userScoreResult.rows.length === 0) {
      const userQuery = 'SELECT username FROM users WHERE google_id = $1';
      const userResult = await pool.query(userQuery, [username]);

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        const google_name = userResult.rows[0].username;
        const createUserQuery = 'INSERT INTO leaderboard (username, score, google_name) VALUES ($1, $2, $3)';
        await pool.query(createUserQuery, [username, 0, google_name]);
        res.status(200).json({ username: username, score: 0 });
      } 
    } else {
      const { score, google_name, username } = userScoreResult.rows[0];
      res.status(200).json({ username: username, score: score });
    }
  } catch (error) {
    console.error(`Error fetching ${username}'s score from leaderboard:`, error.message);
    res.status(500).json({ error: 'Error fetching user score from leaderboard' });
  }
});

// Update leaderboard
app.post('/api/leaderboard', async (req, res) => {
  const { username, score } = req.body;

  try {
    // Check if the user already has a score in the leaderboard
    const userScoreQuery = 'SELECT * FROM leaderboard WHERE username = $1';
    const userScoreResult = await pool.query(userScoreQuery, [username]);

    if (userScoreResult.rows.length > 0) {
      // Update the existing score if the new score is higher
      if (score != userScoreResult.rows[0].score) {
        const updateScoreQuery = 'UPDATE leaderboard SET score = $1 WHERE username = $2 RETURNING *';
        const updatedScore = await pool.query(updateScoreQuery, [score, username]);

        res.status(200).json({ message: 'Score updated successfully', updatedScore: updatedScore.rows[0] });
      } else {
        res.status(200).json({ message: 'Score not higher than the existing score' });
      }
    } else {
      // Insert a new entry if the user doesn't have a score in the leaderboard
      const insertScoreQuery = 'INSERT INTO leaderboard (username, score) VALUES ($1, $2) RETURNING *';
      const insertedScore = await pool.query(insertScoreQuery, [username, score]);

      res.status(201).json({ message: 'Score added to the leaderboard', insertedScore: insertedScore.rows[0] });
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error.message);
    res.status(500).json({ error: 'Error updating leaderboard' });
  }
});

// Google OAuth 2.0
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

// Google OAuth 2.0 - Callback
app.get(
  '/auth/google/hangman',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  (req, res) => {
    // Successful authentication
    console.log(req.user)
    res.redirect('/');
  }
);

// Check User Session
app.get('/api/user/check-session', (req, res) => {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    // If the user is authenticated, send back user information
    console.log(req.user);
    res.status(200).json({ user: req.user });
  } else {
    // If the user is not authenticated, send an empty response
    res.status(200).json({});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

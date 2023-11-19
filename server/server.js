// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pg = require('pg');
require('dotenv').config({ path: 'server/.env' });

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

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

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

// Register a new user
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

    res.status(201).json({ id: insertedUser.rows[0].id, username: insertedUser.rows[0].username });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// User login
app.post('/api/user/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username exists
    const userQuery = 'SELECT * FROM users WHERE username = $1';
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store the user ID in the session
    req.session.userId = userResult.rows[0].id;

    res.status(200).json({ message: 'Login successful', username: userResult.rows[0].username });
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Error logging in' });
  }
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
    const userScoreQuery = 'SELECT score FROM leaderboard WHERE username = $1';
    const userScoreResult = await pool.query(userScoreQuery, [username]);

    if (userScoreResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found in the leaderboard' });
    } else {
      const userScore = userScoreResult.rows[0].score;
      res.status(200).json({ username, score: userScore });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

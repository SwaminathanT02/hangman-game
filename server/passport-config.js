const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const pg = require('pg');
require('dotenv').config({ path: 'server/.env' });

// Import the pool and other necessary configurations
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const userQuery = 'SELECT * FROM users WHERE username = $1';
        const userResult = await pool.query(userQuery, [username]);
  
        if (userResult.rows.length === 0) {
          return done(null, false, { message: 'Invalid username' });
        }
  
        const user = userResult.rows[0];
  
        const isValidPassword = await bcrypt.compare(password, user.password);
  
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid password' });
        }
  
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return done(null, false);
    }

    const user = userResult.rows[0];

    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:5001/auth/google/hangman`,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user is already authenticated
        if (req.user) {
          // Link Google account to the existing user account
          // Update the database with Google ID and other details as needed
          return done(null, req.user);
        }

        // Check if the user already exists in your database by Google ID
        const userQuery = 'SELECT * FROM users WHERE google_id = $1';
        const userResult = await pool.query(userQuery, [profile.id]);

        if (userResult.rows.length > 0) {
          // User exists, log them in
          return done(null, userResult.rows[0]);
        }

        // If the user doesn't exist, create a new user in the database
        const insertUserQuery =
          'INSERT INTO users (google_id, username) VALUES ($1, $2) RETURNING *';
        const insertedUser = await pool.query(insertUserQuery, [
          profile.id,
          profile.displayName,
        ]);

        return done(null, insertedUser.rows[0]);
      } catch (error) {
        return done(error);
      }
    }
  )
);


module.exports = passport;

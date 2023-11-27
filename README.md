# HangMan Game

An interactive Hangman game web app with customizable themes, authenticated user profiles, and persistent score tracking. This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Key Features
- Smooth and responsive UI with colorful themes
- Random word generation with part-of-speech filters
- Persistent user profiles with password encryption
- Secured login system with Passport.js and Google OAuth 2.0
- Leaderboard to track top scorers
- Lookup definitions easily during gameplay
- Fully documented codebase and API references

## Technologies Used
- React.js
- Node.js
- Express.js
- Axios
- REST API
- Passport.js
- Google OAuth 2.0
- PostgreSQL
- Bcrypt encryption
- HTML
- CSS


## Getting Started
### Prerequisites

- Node.js > v14 and npm

### Installation

```bash
# Clone the repository   
git clone https://github.com/SwaminathanT02/hangman-game.git

# Navigate to client directory  
cd hangman-game   

# Run Startup Script
source startup_script

# Project hosted on http://localhost:5001
```

## API Reference

Documentation for external APIs can be referred here for [Random Word Generator](https://random-word-api.herokuapp.com) and [Dictionary API](https://api.dictionaryapi.dev/api/v2/entries/en/).

Some key endpoints in the backend server:

#### Register New User:
```http
POST /api/auth/register
```

#### Login:
```http
POST /api/auth/login
```

#### Google Login (OAuth 2.0):
```http
POST /api/google
```

#### Fetch Leaderboard:
```http
GET /api/leaderboard
```

#### Fetch Random Word:
```http
GET /api/word
```

#### Fetch meaning for current word:
```http
GET /api/word/:word/meaning
```

## Contributing
Pull requests are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for details.

## License
This project is licensed under the MIT license. See [LICENSE](LICENSE) for more details.

Let me know if you need any other changes!

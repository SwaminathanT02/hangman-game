import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameHeader from './GameHeader';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import GameOutcome from './GameOutcome';
import Leaderboard from './Leaderboard';
import LoginForm from './Auth/LoginForm';
import LogoutButton from './Auth/LogoutButton';


const serverURL = "http://localhost:5001";
const totalTries = 6;

const Hangman = () => {
  const [user, setUser] = useState(null);
  const [selectedWord, setSelectedWord] = useState('');
  const [guessedWord, setGuessedWord] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wordMeanings, setWordMeanings] = useState(null);
  const [correctGuessIndexes, setCorrectGuessIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);


  const fetchWordAndMeaning = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverURL}/api/word`);
      const wordFromServer = response.data.word.toUpperCase();
      setSelectedWord(wordFromServer);
      setGuessedWord(Array(wordFromServer.length).fill('_'));
      setGuessedLetters(new Set());
      setCorrectGuessIndexes([]);
      setWordMeanings(null);
      setMistakes(0);
      setGameOver(false);
      
      const meaningResponse = await axios.get(`${serverURL}/api/word/${wordFromServer}/meaning`);
      const meanings = meaningResponse.data.meanings;
      
      if (meanings && meanings.length > 0) {
        setWordMeanings(meanings);
      } else {
        console.log('Meaning not found for the word.');
      }
    } catch (error) {
      console.error('Error fetching word or meaning:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = async (letter) => {
    if (!gameOver) {
      const updatedGuessedWord = [...guessedWord];
      let correctGuess = false;

      for (let i = 0; i < selectedWord.length; i++) {
        if (selectedWord[i] === letter) {
          updatedGuessedWord[i] = letter;
          correctGuess = true;
          setCorrectGuessIndexes((prevIndexes) => [...prevIndexes, i]);
        }
      }

      if (!correctGuess) {
        setMistakes((prevMistakes) => prevMistakes + 1);
        blinkMistakesParagraph();

        // Update the user's score for incorrect guess
        try {
          if (user) {
            const newScore = Math.max((user.score || 0) - 2, 0);
            await axios.post(`${serverURL}/api/leaderboard`, {
              username: user.username,
              score: newScore,
            });
            setUser((prevUser) => ({ ...prevUser, score: newScore }));
          }
        } catch (error) {
          console.error('Error updating user score:', error.message);
        }

        if (mistakes + 1 === totalTries) {
          setGameOver(true);
        }
      } else {
        try {
          if (user && !guessedLetters.has(letter)) {
            await axios.post(`${serverURL}/api/leaderboard`, {
              username: user.username,
              score: (user.score || 0) + 10,
            });
            setUser((prevUser) => ({ ...prevUser, score: (user.score || 0) + 10 }));
            setGuessedLetters((prevGuessedLetters) => new Set(prevGuessedLetters).add(letter));
          }
        } catch (error) {
          console.error('Error updating user score:', error.message);
        }
      }

      setGuessedWord(updatedGuessedWord);
      if (updatedGuessedWord.join('') === selectedWord) {
        setGameOver(true);
      }
    }
  };

  
  const blinkMistakesParagraph = () => {
    const mistakesParagraph = document.querySelector('.mistakes-paragraph');
    mistakesParagraph.classList.add('blink-red');
    setTimeout(() => {
      mistakesParagraph.classList.remove('blink-red');
    }, 500);
  };

  const handleUserAuthentication = async (userData) => {
    try {
      const response = await axios.get(`${serverURL}/api/leaderboard/${userData.username}`);
      // Assuming the response.data contains the user's score
      const userWithScore = {
        username: userData.username,
        score: response.data.score || 0, // Default to 0 if the score is not available
      };
  
      setUser(userWithScore);
    } catch (error) {
      console.error('Error fetching user information:', error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleLeaderboardButtonClick = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  useEffect(() => {
    fetchWordAndMeaning();
  }, []);

  return (
    <div>
      <GameHeader />

      {user ? (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {gameOver ? (
                <div>
                  <img className='stick-image' src={require(`../images/stick-${mistakes}.png`)} alt={`Stick figure with ${mistakes} mistakes`} />
                  <p>Total Score: {user.score}</p>
                  <GameOutcome
                    mistakes={mistakes}
                    selectedWord={selectedWord}
                    gameOver={gameOver}
                    wordMeanings={wordMeanings}
                    loadingMeaning={!wordMeanings}
                    resetGame={fetchWordAndMeaning}
                    totalTries={totalTries}
                  />
                  <button className="leaderboard-button" onClick={handleLeaderboardButtonClick}>
                    {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
                  </button>
                  <LogoutButton onLogout={handleLogout} />
                  <Leaderboard user={user} isVisible={showLeaderboard} />
                </div>
              ) : (
                <>
                  <img className='stick-image' src={require(`../images/stick-${mistakes}.png`)} alt={`Stick figure with ${mistakes} mistakes`} />
                  <p>YOUR TOTAL SCORE: {user.score}</p>
                  <p className='mistakes-paragraph'>REMAINING TRIES: {totalTries - mistakes}</p>
                  <WordDisplay guessedWord={guessedWord} correctGuessIndexes={correctGuessIndexes} />
                  <Keyboard handleGuess={handleGuess} gameOver={gameOver} />
                  <button className="leaderboard-button" onClick={handleLeaderboardButtonClick}>
                    {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
                  </button>
                  <LogoutButton onLogout={handleLogout} />
                  <Leaderboard user={user} isVisible={showLeaderboard} />
                </>
              )}
            </>
          )}
        </>
      ) : (
            <LoginForm onLogin={handleUserAuthentication} onRegister={handleUserAuthentication} />
          )}
    </div>
  );

};

export default Hangman;

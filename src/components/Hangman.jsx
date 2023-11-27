// --- IMPORTS ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameHeader from './GameHeader';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard';
import GameOutcome from './GameOutcome';
import Leaderboard from './Leaderboard';
import LoginForm from './Auth/LoginForm';
import LogoutButton from './Auth/LogoutButton';
import { fetchWordFromServer, fetchWordMeaning, updateUserScore, getUserScore } from './Api';

// --- CONSTANTS ---
const serverURL = "";
const totalTries = 6;

// --- COMPONENTS ---
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
      const wordFromServer = await fetchWordFromServer(serverURL);
      setSelectedWord(wordFromServer);
      setGuessedWord(Array(wordFromServer.length).fill('_'));
      setGuessedLetters(new Set());
      setCorrectGuessIndexes([]);
      setWordMeanings(null);
      setMistakes(0);
      setGameOver(false);
      const meanings = await fetchWordMeaning(serverURL, wordFromServer);
      setWordMeanings(meanings || null);
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
            await updateUserScore(serverURL, user.username, newScore)
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
            const newScore = (user.score || 0) + 10
            await updateUserScore(serverURL, user.username, newScore)
            setUser((prevUser) => ({ ...prevUser, score: newScore }));
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
      const userScore = await getUserScore(serverURL, userData.username)
      const userWithScore = {
        username: userData.username,
        score: userScore
      };
      setUser(userWithScore);
    } catch (error) {
      console.error('Error fetching user information:', error.message);
    }
  };


  const handleLogout = async () => {
    setUser(null);
  };

  const handleLeaderboardButtonClick = () => {
    setShowLeaderboard(!showLeaderboard);
  };


  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/user/check-session`);
        console.log(`checkSession Data: ${response.data.user}`);
        console.log(`checkSession Google ID: ${response.data.user.google_id}`);
        console.log(`checkSession Username: ${response.data.user.username}`);
        if (response.data.user) {
          handleUserAuthentication({username: response.data.user.google_id || response.data.user.username})
        }
      } catch (error) {
        console.error('Error checking user session:', error.message);
      } finally {
        fetchWordAndMeaning();
      }
    };
    if(!user){
      checkSession();
    }
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
                  <LogoutButton onLogout={handleLogout} serverURL={serverURL} />
                  <Leaderboard user={user} isVisible={showLeaderboard} serverURL={serverURL} />
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
                  <LogoutButton onLogout={handleLogout} serverURL={serverURL} />
                  <Leaderboard user={user} isVisible={showLeaderboard} serverURL={serverURL} />
                </>
              )}
            </>
          )}
        </>
      ) : (
            <LoginForm onLogin={handleUserAuthentication} onRegister={handleUserAuthentication} serverURL={serverURL} />
          )}
    </div>
  );

};

export default Hangman;

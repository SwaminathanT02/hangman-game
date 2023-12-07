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
      if(user){
        await updateDBScore();
      }
      const meanings = await fetchWordMeaning(serverURL, wordFromServer);
      setWordMeanings(meanings || null);
    } catch (error) {
      console.error('Error fetching word or meaning:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGuessedLettersAndScore = (newScore, letter) => {
    setUser((prevUser) => ({ ...prevUser, score: newScore }));
    setGuessedLetters((prevGuessedLetters) => new Set(prevGuessedLetters).add(letter));
  }

  const updateDBScore = async () => {
    try {
      await updateUserScore(serverURL, user.username, user.score)
    } catch (error) {
      console.error('Error updating user score:', error.message);
    }
  }

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
        if(user && !guessedLetters.has(letter)){
          setMistakes((prevMistakes) => prevMistakes + 1);
          blinkMistakesParagraph();
          updateGuessedLettersAndScore(Math.max((user.score || 0) - 1, 0), letter);
        }
        if (mistakes + 1 === totalTries) {
          setGameOver(true);
        }
      } else {
        if (user && !guessedLetters.has(letter)) {
          updateGuessedLettersAndScore((user.score || 0) + 2, letter);
        }
        setGuessedWord(updatedGuessedWord);
        if (updatedGuessedWord.join('') === selectedWord) {
          setGameOver(true);
        }
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
    await updateDBScore();
    setUser(null);
  };

  const handleLeaderboardButtonClick = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/user/check-session`);
        if (response.data.user) {
          handleUserAuthentication({username: response.data.user.google_id || response.data.user.username})
          fetchWordAndMeaning();
        }
      } catch (error) {
        console.error('Error checking user session:', error.message);
      }
    };
    if(!user){
      checkSession();
    }
    if(user){
      fetchWordAndMeaning();
    }
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
                  <Keyboard handleGuess={handleGuess} gameOver={gameOver} guessedLetters={guessedLetters} />
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

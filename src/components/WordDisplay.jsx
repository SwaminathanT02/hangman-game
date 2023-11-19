// Inside WordDisplay.jsx (if it's a separate component)
import React from 'react';

const WordDisplay = ({ guessedWord, correctGuessIndexes }) => {
  return (
    <div className="word">
      {guessedWord.map((letter, index) => (
        <span key={index} className={correctGuessIndexes.includes(index) ? 'correct-guess' : ''}>
          {letter}
        </span>
      ))}
    </div>
  );
};

export default WordDisplay;

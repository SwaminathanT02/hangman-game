// --- IMPORTS ---
import React from 'react';

// --- KEYBOARD FUNCTION ---
const Keyboard = ({ handleGuess, gameOver, guessedLetters }) => {

  return (
    <div className="keyboard">
      {Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).map((letter, index) => (
        <button key={letter} onClick={() => handleGuess(letter)} disabled={gameOver} className={guessedLetters.has(letter) ? 'guessed' : ''}>
          {letter}
        </button>
      ))}
    </div>
  );
};

export default Keyboard;

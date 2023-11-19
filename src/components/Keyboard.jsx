// --- IMPORTS ---
import React from 'react';

// --- KEYBOARD FUNCTION ---
const Keyboard = ({ handleGuess, gameOver }) => {
  return (
    <div className="keyboard">
      {Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).map((letter, index) => (
        <button key={letter} onClick={() => handleGuess(letter)} disabled={gameOver}>
          {letter}
        </button>
      ))}
    </div>
  );
};

export default Keyboard;

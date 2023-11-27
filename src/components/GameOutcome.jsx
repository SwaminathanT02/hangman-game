// --- IMPORTS ---
import React from 'react';
import OutcomeMessage from './OutcomeMessage';
import Meaning from './WordMeaning';

// --- GAMEOUTCOME FUNCTION ---
const GameOutcome = ({ mistakes, selectedWord, gameOver, wordMeanings, loadingMeaning, resetGame, totalTries }) => (
  <div>
    {gameOver && (
      <div>
        <button className="play-again" onClick={resetGame}>
          Play Again
        </button>
        <OutcomeMessage mistakes={mistakes} selectedWord={selectedWord} gameOver={gameOver} totalTries={totalTries} />
        <Meaning wordMeanings={wordMeanings} loadingMeaning={loadingMeaning} />
      </div>
    )}
  </div>
);

export default GameOutcome;

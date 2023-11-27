import React from "react";

// --- OUTCOME MESSAGE COMPONENT ---
const OutcomeMessage = ({ mistakes, selectedWord, gameOver, totalTries }) => (
    <p className='game-over-message'>
      {gameOver ? (
        mistakes === totalTries ? (
          <>
            Game Over!
            <br /><br /><br />
            <span className="highlighted-word">
              <span className='correct-word'>WORD:</span> {selectedWord}
            </span>
          </>
        ) : (
          <>
            Congratulations! You guessed the word right!
            <br /><br /><br />
            <span className="highlighted-word">
              <span className='correct-word'>WORD:</span> {selectedWord}
            </span>
          </>
        )
      ) : null}
    </p>
  );

export default OutcomeMessage;
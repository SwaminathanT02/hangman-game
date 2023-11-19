// --- IMPORTS ---
import React from 'react';

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

// --- MEANING COMPONENT ---
const Meaning = ({ wordMeanings, loadingMeaning }) => (
  <>
    {loadingMeaning ? (
      <p></p>
    ) : (
      <>
        {wordMeanings && wordMeanings.length > 0 ? (
          <div>
            {wordMeanings.map((meaning, index) => (
              <div key={index}>
                <p className='part-of-speech'>{meaning.partOfSpeech}</p>
                <p className='word-meaning'>{meaning.definitions[0]?.definition}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className='correct-word'>Meaning not found for the word.</p>
        )}
      </>
    )}
  </>
);

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

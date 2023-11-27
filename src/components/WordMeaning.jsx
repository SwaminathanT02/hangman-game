// --- IMPORTS ---
import React from "react";

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

export default Meaning;
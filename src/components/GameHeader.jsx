// --- IMPORTS ---
import React from 'react';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

// --- GAMEHEADER FUNCTION ---
const GameHeader = () => {
  return (
    <h1>
      <SentimentSatisfiedAltIcon /> Hangman <SentimentVeryDissatisfiedIcon />
    </h1>
  );
};

export default GameHeader;

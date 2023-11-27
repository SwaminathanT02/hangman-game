import axios from 'axios';

export const fetchWordFromServer = async (serverURL) => {
  const response = await axios.get(`${serverURL}/api/word`);
  return response.data.word.toUpperCase();
};

export const fetchWordMeaning = async (serverURL, word) => {
  const response = await axios.get(`${serverURL}/api/word/${word}/meaning`);
  return response.data.meanings || null;
};

export const updateUserScore = async (serverURL, username, newScore) => {
  await axios.post(`${serverURL}/api/leaderboard`, { username, score: newScore });
};

export const getUserScore = async (serverURL, username) => {
  const response = await axios.get(`${serverURL}/api/leaderboard/${username}`);
  return response.data.score || 0;
};

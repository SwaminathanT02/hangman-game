import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = ({ user, isVisible, serverURL }) => {
  const [userRank, setUserRank] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data and user rank from the server
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${serverURL}/api/leaderboard`);
        const leaderboard = response.data;
        console.log(leaderboard);
        setLeaderboard(leaderboard);

        // Find and set the user's rank
        if (user) {
          const userIndex = leaderboard.findIndex((entry) => entry.username === user.username);
          setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
      }
    };

    fetchLeaderboard();
  }, [user]);

  return (
    <div className={`leaderboard`}>
    {isVisible &&
      <>
      <h2>LEADERBOARD</h2>
      {userRank && <p className="user-rank">Your Rank: {userRank}</p>}
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={entry.id} className={entry.username === user.username ? 'user-entry' : ''}>
            <span className="rank">{index + 1}.</span> {entry.google_name || entry.username}: {entry.score}
          </li>
        ))}
      </ul>
    </>
    }
    </div>
  );
};

export default Leaderboard;

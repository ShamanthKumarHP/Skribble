// src/components/GameStatus.js
import React, { useState, useEffect } from 'react';
import socket from './Socket'; // Replace with your server URL

function GameStatus() {
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    // Listen for updates on the game status from the server
    socket.on('gameStatus', (status) => {
      setGameStatus(status);
    });

    // Cleanup function
    return () => {
      socket.off('gameStatus');
    };
  }, []);

  return (
    <div>
      {gameStatus && (
        <div>
          <h2>Game Status</h2>
          <p>{gameStatus}</p>
        </div>
      )}
    </div>
  );
}

export default GameStatus;

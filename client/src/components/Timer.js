// src/components/Timer.js
import React, { useState, useEffect } from 'react';
import socket from './Socket'; // Replace with your server URL

function Timer() {
  const [secondsRemaining, setSecondsRemaining] = useState();

  useEffect(() => {
    let timer;

    // Listen for updates on the current round from the server
    socket.on('roundUpdate', () => {
      // Reset the timer when a new round starts
      setSecondsRemaining(20);
    });

    socket.on('updateTimer',() =>{
      setSecondsRemaining(0)
    })

    // Start the timer
    if (secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prevSeconds) =>
          prevSeconds > 0 ? prevSeconds - 1 : 0
        );
      }, 1000);
    }

    // Stop the timer when it reaches zero
    if (secondsRemaining === 0) {
      clearInterval(timer);
      // Automatically start a new round when the timer reaches zero
      console.log("emmiting event as timer become 0")
      socket.emit('newTurn');
    }

    // Cleanup function
    return () => {
      clearInterval(timer);
      socket.off('roundUpdate');
      socket.off('updateTimer')
    };
  }, [secondsRemaining]);

  return (
    <div>
      <h2>Timer</h2>
      <p>Time Remaining: {secondsRemaining} seconds</p>
    </div>
  );
}

export default Timer;

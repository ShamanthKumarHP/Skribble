// src/App.js
import React, { useEffect, useState } from "react";
import DrawingBoard from "./components/DrawingBoard";
import GuessForm from "./components/GuessForm";
import PlayerList from "./components/PlayerList";
import GameStatus from "./components/GameStatus";
import Timer from "./components/Timer";
import GameOver from "./components/GameOver";
import WaitingScreen from "./components/WaitingScreen";
import CurrentWord from "./components/CurrentWord";
import CorrectGuessHandling from "./components/CorrectGuessHandling";
import Scoring from "./components/Scoring";
import RestartGame from "./components/RestartGame";
import WordListSelection from "./components/WordListSelection";
import PlayerTurnMessage from "./components/PlayerTurnMessage";
import TurnTimer from "./components/TurnTimer";
import WordHint from "./components/WordHint";
import PlayerConnectionStatus from "./components/PlayerConnectionStatus";
import RoundEnd from "./components/RoundEnd";
// import LoginPage from './components/LoginPage';
import "./App.css";
import socket from "./components/Socket"; // Replace with your server URL

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  //const [players, setPlayers] = useState([]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setNewPlayer(user);

    // Inform the server that a new player has joined
    socket.emit("newPlayer", newPlayer);
  };

  useEffect(() => {
    // Socket.io setup
    socket.on("gameStarted", (state) => {
      setIsLoggedIn(state);
    });

    return () => {
      //socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>Skribbl.io Clone</h1>
      <div>
        {isLoggedIn ? (
          <>
            <div style={styles.container}>
              <div style={styles.leftSection}>
                {/* <PlayerList /> */}
                <Scoring />
                <PlayerTurnMessage />
              </div>
              <div style={styles.rightSection}>
                {/* <PlayerConnectionStatus /> */}
                <Timer />
                <WordHint />
              </div>
            </div>

            <CurrentWord />
            <CorrectGuessHandling />

            <WordListSelection />

            <DrawingBoard />
            <GuessForm />

            {/* <GameStatus /> */}
            <RoundEnd />
            <RestartGame />
            <GameOver />
          </>
        ) : (
          <>
            {/* <LoginPage onLogin={handleLogin} /> */}
            <WaitingScreen onLogin={handleLogin} />
            <PlayerConnectionStatus />
            <PlayerList />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
  },
  leftSection: {
    width: "45%", // Adjust width as needed
  },
  rightSection: {
    width: "45%", // Adjust width as needed
  },
};

export default App;

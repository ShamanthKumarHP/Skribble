// server/Game.js
// To debug socket issue https://socket.io/docs/v3/troubleshooting-connection-issues/
class Game {
  constructor(io) {
    this.io = io;
    this.players = [];
    this.currentPlayerIndex = 0;
    this.currentWordIndex = 0;
    this.words = ["apple", "banana", "cherry"]; // Add more words as needed
    this.timer = 20;
    this.gameStarted = false;
    this.currentWord = "";
    this.currentPlayer = "";
  }

  addPlayer(player) {
    this.players.push(player);

    // Check if the required number of players is reached to start the game
    // if (this.players.length === 2 && this.gameStarted) {
    //   this.startGame();
    // }
  }
  removePlayer(playerId) {
    const index = this.players.findIndex((player) => player.id === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }

    // Check if there are still players in the game
    if (this.players.length === 0) {
      this.gameStarted = false;
    }
  }

  updatePlayerList() {
    return this.players.map(({ id, name, score }) => ({ id, name, score }));
  }

  startGame() {
    this.io.emit("gameStarted", true);
    this.sendPlayerTurn();
    // this.sendNewWord();
    this.handleWordGuess("");
    this.sendWordList();
  }

  endGame() {
    // Handle end of the game logic
    let highScore = 0;
    let winners = []
    this.players.map(({ id, name, score }, idx) => {
      if (score > highScore) {
        winners = []
        highScore = score;
        winners.push(name)
      }
      else if (score == highScore){
        winners.push(name)
      }
    });

    if (winners.length === this.players.length) {
      winners = ''
    }
    else{
      winners = winners.join(', ')
    }
    console.log(winners)
    this.io.emit("roundEnd", winners);
    this.io.emit("showRestartButton", true);
    this.io.emit("gameOver", true);
    this.gameStarted = false;
  }

  clearDrawingBoard() {
    this.emitToAll("clearDrawingForAll");
  }

  startTurnTimer() {
    this.io.emit("roundUpdate");
    const intervalId = setInterval(() => {
      this.timer--;

      if (this.timer <= 0) {
        clearInterval(intervalId);
        this.sendTimerUpdate();
        this.nextTurn();
      }
    }, 1000);
  }

  nextTurn() {
    console.log("triggering next turn");
    this.currentWordIndex++;
    this.currentPlayerIndex++;

    if (this.currentPlayerIndex >= this.players.length) {
      this.currentPlayerIndex = 0;
    }

    if (this.currentWordIndex >= this.words.length) {
      this.endGame();
      return;
    } else {
      this.sendPlayerTurn();
      // this.sendNewWord();
      this.timer = 20;
      //this.startTurnTimer();
      this.handleWordGuess("");
      this.sendWordList();
    }
  }

  selectWord(word) {
    this.newWord = word;
    console.log(word);
    this.emitDifferently("updateCurrentWord", this.newWord);
    this.emitToNonCurrentPlayer("showGuessForm", true);
    this.sendWordHint();
    this.startTurnTimer();
  }

  sendNewWord() {
    this.newWord = this.words[this.currentWordIndex];
    this.io.emit("updateCurrentWord", this.newWord);
  }

  shuffleWords() {
    // Shuffle the array of words (Fisher-Yates algorithm)
    for (let i = this.words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.words[i], this.words[j]] = [this.words[j], this.words[i]];
    }
  }

  sendWordList() {
    const wordList = this.words.slice(
      this.currentWordIndex,
      this.currentWordIndex + 3
    );
    this.emitDifferently("wordList", wordList);
    this.emitToAll("updateCurrentWord", null);
    this.emitToAll("wordHint", null);
  }

  sendWordHint() {
    const hint =
      this.newWord.substring(0, 2) + " _ ".repeat(this.newWord.length - 2);
    this.emitToAll("wordHint", hint);
  }

  sendPlayerTurn() {
    this.currentPlayerName = this.players[this.currentPlayerIndex].name;
    this.currentPlayerID = this.players[this.currentPlayerIndex].id;
    this.io.emit("playerTurn", {
      name: this.currentPlayerName,
      id: this.currentPlayerID,
    });
  }

  sendTimerUpdate() {
    // not used in client and not working
    this.emitToAll("updateTimer", this.timer);
  }

  handleWordGuess(guessedWord, socketID) {
    var updateScores = [];
    if (
      guessedWord &&
      guessedWord.toLowerCase() === this.newWord.toLowerCase()
    ) {
      this.players.map(({ id, name, score }, idx) => {
        if (id === socketID) {
          let obj = {
            id: id,
            name: name,
            score: score + 1,
          };
          updateScores.push(obj);
          this.players[idx].score = score + 1;
        } else {
          let obj = {
            id: id,
            name: name,
            score: score,
          };
          updateScores.push(obj);
        }
      });
      this.emitToAll("correctWordGuess", updateScores);
      //TODO
      this.timer = 0
    } else {
      this.players.map(({ id, name, score }, idx) => {
        let obj = {
          id: id,
          name: name,
          score: score,
        };
        updateScores.push(obj);
      });
      this.io.emit("correctWordGuess", updateScores);
    }
  }

  restartGame() {
    // Reset game state
    console.log("reset the game");
    this.currentWord = ""; // Reset the current word
    this.players.forEach((player) => {
      player.score = 0; // Reset player scores
    });
    this.currentPlayerIndex = 0;
    this.currentWordIndex = 0;
    this.timer = 20;
    this.startGame();
    this.io.emit("roundStart");
  }

  emitToAll(event, data) {
    //console.log(`Emitting ${event} to all players`);
    this.players.forEach((player) => {
      if (player.socket) {
        //console.log(`Emitting to player ${player.name}`);
        player.socket.emit(event, data);
      }
    });
  }

  emitDifferently(event, data) {
    this.players.forEach((player) => {
      if (player.id == this.currentPlayerID) {
        player.socket.emit(event, data);
      } else {
        player.socket.emit(event, null);
      }
    });
  }

  emitToNonCurrentPlayer(event, data) {
    this.players.forEach((player) => {
      if (player.id != this.currentPlayerID) {
        player.socket.emit(event, data);
      } else {
        player.socket.emit(event, null);
      }
    });
  }

  emitDrawing(data) {
    //console.log(this.currentPlayer, " is drawing", data)
    this.players.forEach((player) => {
      if (player.id != this.currentPlayerID) {
        //console.log("emiting to", player.name)
        player.socket.emit("drawing", data);
      }
    });
  }

  emitNewStroke() {
    this.players.forEach((player) => {
      if (player.id != this.currentPlayerID) {
        player.socket.emit("newStroke");
      }
    });
  }
}
module.exports = Game;

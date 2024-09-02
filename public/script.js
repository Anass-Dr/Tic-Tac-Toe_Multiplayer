"use strict";

// websocket
const socket = io();

// Global variables
const userId = localStorage.getItem("userId");
const gameId = localStorage.getItem("gameId");
let gameInfo = {
  role: 0,
  nbOfMovements: 0,
  movements: Array.from({ length: 20 }, () => Array(20).fill(null)),
  results: [0, 0, 0],
  players: [],
};

// Refresh Player info
socket.emit("refresh", userId);

// fetch Game infos
fetchGameInfo();

const board = document.getElementById("board");
const roleSpan = document.querySelector("#role span");
const playersResultsSpans = document.querySelectorAll(".players-results");

// Fill the board with 20x20 divs
Array(400)
  .fill(0)
  .map((_, i) =>
    board.insertAdjacentHTML(
      "beforeend",
      `<div class="board__div" data-index=${i} data-empty=true>
        <i class="fa-solid fa-xmark hidden"></i>
        <i class="fa-regular fa-circle hidden"></i>
      </div>
    `
    )
  );

board.addEventListener("click", (e) => {
  if (
    userId !== gameInfo.players[gameInfo.role].id ||
    e.target.dataset.empty === "false" ||
    !e.target.classList.contains("board__div")
  )
    return;

  socket.emit("newMove", {
    gameId,
    playerIndex: gameInfo.players.findIndex((item) => item.id === userId),
    moveIndex: e.target.dataset.index,
  });
});

// Functions :
async function fetchGameInfo() {
  const res = await fetch(`/api/gameInfo/${gameId}`);
  gameInfo = await res.json();
  initialInterface();
}

function updateBoardCell(moveIndex, role) {
  const targetDiv = board.querySelector(`div[data-index="${moveIndex}"]`);
  targetDiv.dataset.empty = "false";
  targetDiv.querySelectorAll("i")[role].classList.remove("hidden");
}

function updateInterface() {
  roleSpan.textContent = gameInfo.players[gameInfo.role].name;
  playersResultsSpans.forEach(
    (el, i) => (el.textContent = gameInfo.results[i])
  );
}

function initialInterface() {
  gameInfo.movements.forEach((row, rowIndx) => {
    row.forEach((move, moveIndx) => {
      if (move !== null) {
        const moveIndex = moveIndx + rowIndx * 20;
        updateBoardCell(moveIndex, move);
      }
    });
  });
  updateInterface();
}

function resetBoard() {
  socket.emit("boardReset", {
    gameId,
    playerIndex: gameInfo.players.findIndex((item) => item.id === userId),
  });
}

function quit() {
  const answer = confirm("Are you sure you want to quit the game?");
  if (answer)
    socket.emit("gameEnd", {
      gameId,
      playerIndex: gameInfo.players.findIndex((item) => item.id === userId),
    });
}

// Listen for New Move event
socket.on("newMove", ({ game, moveIndex }) => {
  const prevGame = gameInfo;
  gameInfo = game;
  updateBoardCell(moveIndex, gameInfo.role ? 0 : 1);
  updateInterface();
  for (let i = 0; i < 3; i++) {
    if (gameInfo.results[i] !== prevGame.results[i]) {
      if (i == 2) alert(`There was draw!`);
      else alert(`${gameInfo.players[i].name} is win!`);
      resetBoard();
      break;
    }
  }
});

// Listen for Game end
socket.on("gameEnd", (playerIndex) => {
  if (gameInfo.players.findIndex((item) => item.id === userId) !== playerIndex)
    alert("the Other player quit the game!");
  window.location.replace("/");
});

// Listen for Game Reset request
socket.on("boardResetReq", () => {
  const answer = confirm("Other player wants to reset the Game progress!");
  socket.emit("boardResetResponse", {
    gameId,
    playerIndex: gameInfo.players.findIndex((item) => item.id === userId),
    answer,
  });
});

// Listen for Game Reset request refused
socket.on("boardResetRefused", () =>
  alert("The other player refused your reset request")
);

// Listen for Board Reset
socket.on("boardReset", (game) => {
  gameInfo = game;
  document
    .querySelectorAll(".board__div i")
    .forEach((el) => el.classList.add("hidden"));
});

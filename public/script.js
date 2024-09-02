"use strict";

// websocket
const socket = io();

// Global variables
const userId = localStorage.getItem("userId");
const gameId = localStorage.getItem("gameId");
let gameInfo = {
    role: 0,
    nbOfMovements: 0,
    movements: Array.from({length: 20}, () => Array(20).fill(null)),
    results: [0, 0, 0],
    players: [],
};

// Refresh Player info
socket.emit("refresh", {
    userId,
    page: "game",
    gameId
});

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
socket.on("newMove", ({game, moveIndex}) => {
    const prevGame = gameInfo;
    gameInfo = game;
    updateBoardCell(moveIndex, gameInfo.role ? 0 : 1);
    updateInterface();
    for (let i = 0; i < 3; i++) {
        if (gameInfo.results[i] !== prevGame.results[i]) {
            if (i === 2) alert(`No winner this time, it's a tie! Try again? 😊`);
            else alert(`Amazing move! ${gameInfo.players[i].name} won the game! 🎊`);
            document
                .querySelectorAll(".board__div i")
                .forEach((el) => el.classList.add("hidden"));
            break;
        }
    }
});

// Listen for Game end
socket.on("gameEnd", (playerIndex) => {
    if (gameInfo.players.findIndex((item) => item.id === userId) !== playerIndex)
        alert("The game has ended because your opponent quit. Better luck next time! 👋");
    localStorage.removeItem("gameId");
    window.location.replace("/");
});

// Listen for Game Reset request
socket.on("boardResetReq", () => {
    const answer = confirm("Opponent wants to reset the board. Will you agree to start over? ⏳");
    socket.emit("boardResetResponse", {
        gameId,
        playerIndex: gameInfo.players.findIndex((item) => item.id === userId),
        answer,
    });
});

// Listen for Game Reset request refused
socket.on("boardResetRefused", () =>
    alert("Your opponent declined the board reset request. Keep playing! ❌")
);

// Listen for Board Reset
socket.on("boardReset", (game) => {
    gameInfo = game;
    document
        .querySelectorAll(".board__div i")
        .forEach((el) => el.classList.add("hidden"));
});

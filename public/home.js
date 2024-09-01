let userName =
  localStorage.getItem("username") ||
  prompt("Please enter your username: ").toLowerCase();

while (userName.length < 3) {
  userName = prompt("Please enter a valid username: ").toLowerCase();
}

let onlinePlayers = [];
if (localStorage.getItem("userId"))
  document.cookie = `userId=${localStorage.getItem("userId")}`;

const socket = io();

// Update list of online players
socket.on("onlinePlayers", (players) => {
  updateInterface(
    players.filter((player) => player._id !== localStorage.getItem("userId"))
  );
});

// Add new player
if (!localStorage.getItem("username")) {
  localStorage.setItem("username", userName);
  socket.emit("login", userName);
  socket.on("login", (userId) => {
    localStorage.setItem("userId", userId);
    document.cookie = `userId=${userId}`;
  });
} else {
  // Refresh Player info
  socket.emit("refresh", localStorage.getItem("userId"));
  fetchOnlinePlayers();
}

// Send Game request to player
function sendGameRequest(playerId) {
  socket.emit("gameRequest", playerId);
  alert("Game Request sended!");
}

// Listen for a Game request
socket.on("gameRequest", ({ reqUsername, reqUserId }) => {
  const answer = confirm(`${reqUsername} wants to play with you!`);
  if (answer) {
    socket.emit("gameStart", reqUserId);
  } else {
    socket.emit("gameRequestRefuse", { reqUserId, userName });
  }
});

// Listen for a Game request refuse
socket.on("gameRequestRefuse", (username) =>
  alert(`${username} refused your game request`)
);

// Listen for Game start
socket.on("gameStart", (gameId) => {
  localStorage.setItem("gameId", gameId);
  window.location.replace(`/game/${gameId}`);
});

// Fetch online Players
async function fetchOnlinePlayers() {
  const res = await fetch("/onlinePlayers");
  const data = await res.json();
  const userId = localStorage.getItem("userId") || "";
  updateInterface(data.filter((player) => player._id !== userId));
}

// Interface manipulation
function createPlayerElement(player) {
  const playerElement = document.createElement("div");
  playerElement.className = "player";

  const status = player.inGame ? "In Game" : "Online";

  playerElement.innerHTML = `
        <div class="player-info">
            <div class="player-avatar">${player.name[0].toUpperCase()}</div>
            <div>
                <div>${player.name}</div>
                <div class="player-status status-${status.toLowerCase()}">${status}</div>
            </div>
        </div>
        <button class="start-game-btn" data-player-id="${player._id}" ${
    status !== "Online" ? "disabled" : ""
  }>
            Start Game
        </button>
    `;

  return playerElement;
}

function populatePlayerList() {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = "";
  onlinePlayers.forEach((player) => {
    playerList.appendChild(createPlayerElement(player));
  });
}

function updateOnlineCount() {
  const countElement = document.getElementById("count");
  countElement.textContent = onlinePlayers.length;
}

function addEventListeners() {
  const playerList = document.getElementById("player-list");
  playerList.addEventListener("click", (event) => {
    if (event.target.classList.contains("start-game-btn")) {
      const playerId = event.target.getAttribute("data-player-id");
      sendGameRequest(playerId);
    }
  });
}

function updateInterface(players) {
  onlinePlayers = players;
  populatePlayerList();
  updateOnlineCount();
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  populatePlayerList();
  updateOnlineCount();
  addEventListeners();
});

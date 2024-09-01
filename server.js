const express = require("express");
const cookieParser = require("cookie-parser");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const eventHandler = require("./services/websocket");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cookieParser());
app.use(express.static("public"));

const pageRoutes = require("./routes/pages");
app.use("/", pageRoutes);

io.on("connection", (socket) => {
  socket.on("login", (username) =>
    eventHandler.loginEvent(username, socket.id, io)
  );
  socket.on("gameRequest", (targetPlayerId) =>
    eventHandler.gameRequestEvent(targetPlayerId, socket.id, io)
  );
  socket.on("gameRequestRefuse", (args) =>
    eventHandler.gameRequestRefuseEvent(args, io)
  );
  socket.on("gameStart", (userId) =>
    eventHandler.gameStartEvent(userId, socket.id, io)
  );
  socket.on("newMove", (args) =>
    eventHandler.newMoveEvent(args, socket.id, io)
  );
  socket.on("boardReset", (args) =>
    eventHandler.boardResetEvent(args, io)
  );
  socket.on("boardResetResponse", (args) =>
    eventHandler.boardResetResponseEvent(args, socket.id, io)
  );
  socket.on("gameEnd", (args) =>
    eventHandler.gameEndEvent(args, socket.id, io)
  );
  socket.on("refresh", (userId) =>
    eventHandler.refreshEvent(userId, socket.id)
  );
  socket.on("disconnect", () => eventHandler.disconnectEvent(socket.id));
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

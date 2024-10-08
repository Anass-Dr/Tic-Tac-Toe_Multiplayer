const {connectToDB} = require("../database");
const {ObjectId} = require("mongodb");
const {getCollection} = require("../helpers/queryHelpers");
const {handleNewMove, handleBoardReset} = require("../services/gameService");

async function loginEvent(userName, socketId, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const document = await playersColl.insertOne({
        name: userName,
        socketId,
        inGame: false,
        currGameId: "",
        online: true,
    });
    const cursor = playersColl.find({online: {$ne: false}});
    const players = await cursor.toArray();

    io.to(socketId).emit("login", document.insertedId.toString());
    io.emit("onlinePlayers", players);
}

async function gameRequestEvent(targetPlayerId, socketId, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const targetPlayer = await playersColl.findOne({
        _id: new ObjectId(targetPlayerId),
    });
    const currPlayer = await playersColl.findOne({socketId});
    io.to(targetPlayer.socketId).emit("gameRequest", {
        reqUsername: currPlayer.name,
        reqUserId: currPlayer._id,
    });
}

async function gameRequestRefuseEvent({reqUserId, userName}, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const targetPlayer = await playersColl.findOne({
        _id: new ObjectId(reqUserId),
    });
    io.to(targetPlayer.socketId).emit("gameRequestRefuse", userName);
}

async function gameStartEvent(userId, socketId, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const gamesColl = await getCollection(connectToDB, "games");

    // Get players infos
    const firstPlayer = await playersColl.findOne({_id: new ObjectId(userId)});
    const secondPlayer = await playersColl.findOne({socketId});

    // Create new game
    const gameDocument = await gamesColl.insertOne({
        role: 0,
        nbOfMovements: 0,
        movements: Array.from({length: 20}, () => Array(20).fill(null)),
        results: [0, 0, 0],
        players: [
            {name: firstPlayer.name, id: firstPlayer._id},
            {name: secondPlayer.name, id: secondPlayer._id},
        ],
    });

    // Update players infos
    const player1 = await playersColl.updateOne(
        {_id: new ObjectId(userId)},
        {$set: {inGame: true, currGameId: gameDocument.insertedId.toString()}}
    );
    const player2 = await playersColl.findOneAndUpdate(
        {socketId},
        {$set: {inGame: true, currGameId: gameDocument.insertedId.toString()}}
    );

    io.to(firstPlayer.socketId).emit(
        "gameStart",
        gameDocument.insertedId.toString()
    );
    io.to(secondPlayer.socketId).emit(
        "gameStart",
        gameDocument.insertedId.toString()
    );
}

async function newMoveEvent({gameId, playerIndex, moveIndex}, socketId, io) {
    const game = await handleNewMove(gameId, moveIndex);
    const playersColl = await getCollection(connectToDB, "players");
    const playerDoc = await playersColl.findOne({
        _id: new ObjectId(game.players[playerIndex ? 0 : 1].id),
    });
    io.to(socketId).emit("newMove", {game, moveIndex});
    io.to(playerDoc.socketId).emit("newMove", {game, moveIndex});
}

async function boardResetEvent({gameId, playerIndex}, io) {
    const gamesColl = await getCollection(connectToDB, "games");
    const playersColl = await getCollection(connectToDB, "players");

    const gameDocument = await gamesColl.findOne({_id: new ObjectId(gameId)});
    const playerDoc = await playersColl.findOne({
        _id: new ObjectId(gameDocument.players[playerIndex ? 0 : 1].id),
    });

    io.to(playerDoc.socketId).emit("boardResetReq");
}

async function boardResetResponseEvent(
    {gameId, playerIndex, answer},
    socketId,
    io
) {
    const gamesColl = await getCollection(connectToDB, "games");
    const playersColl = await getCollection(connectToDB, "players");

    const game = answer
        ? await handleBoardReset(gameId)
        : await gamesColl.findOne({_id: new ObjectId(gameId)});

    const playerDoc = await playersColl.findOne({
        _id: new ObjectId(game.players[playerIndex ? 0 : 1].id),
    });

    if (answer) {
        io.to(socketId).emit("boardReset", game);
        io.to(playerDoc.socketId).emit("boardReset", game);
    } else {
        io.to(playerDoc.socketId).emit("boardResetRefused");
    }
}

async function gameEndEvent({gameId, playerIndex}, socketId, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const gamesColl = await getCollection(connectToDB, "games");
    const gameDocument = await gamesColl.findOne({_id: new ObjectId(gameId)});

    playersColl.updateMany(
        {currGameId: gameId},
        {$set: {inGame: false, currGameId: ""}}
    );
    const playerDoc = await playersColl.findOne({
        _id: new ObjectId(gameDocument.players[playerIndex ? 0 : 1].id),
    });

    io.to(socketId).emit("gameEnd", playerIndex);
    io.to(playerDoc.socketId).emit("gameEnd", playerIndex);
}

async function refreshEvent({userId, page, gameId}, socketId, io) {
    const playersColl = await getCollection(connectToDB, "players");
    const gamesColl = await getCollection(connectToDB, "games");
    const player = await playersColl.findOneAndUpdate(
        {_id: new ObjectId(userId)},
        {$set: {online: true, socketId}}
    );

    if (page === "home" && player.inGame) {
        const gameDocument = await gamesColl.findOne({_id: new ObjectId(gameId)})
        const playerIndex = gameDocument.players.findIndex((item) => item.id === player._id)
        io.to(socketId).emit("backToGame", {gameId, playerIndex});
    }
}

async function disconnectEvent(socketId) {
    const playersColl = await getCollection(connectToDB, "players");
    const result = await playersColl.updateOne(
        {socketId},
        {$set: {online: false}}
    );
}

const eventHandler = {
    loginEvent,
    newMoveEvent,
    gameRequestEvent,
    gameRequestRefuseEvent,
    gameEndEvent,
    gameStartEvent,
    boardResetEvent,
    boardResetResponseEvent,
    disconnectEvent,
    refreshEvent,
};

module.exports = eventHandler;

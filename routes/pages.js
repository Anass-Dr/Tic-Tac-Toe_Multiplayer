const express = require("express");
const path = require("path");
const { connectToDB } = require("../database");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../helpers/queryHelpers");

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

router.get("/game/:gameId", async (req, res) => {
  const playersColl = await getCollection(connectToDB, "players");
  const player = await playersColl.findOne({
    _id: new ObjectId(req.cookies.userId),
  });
  if (player.currGameId === req.params.gameId)
    res.sendFile(path.join(__dirname, "../views/game.html"));
  else res.redirect("/");
});

router.get("/onlinePlayers", async (req, res) => {
  const playersColl = await getCollection(connectToDB, "players");
  const cursor = playersColl.find({});
  const players = await cursor.toArray();
  res.json(players);
});

router.get("/gameInfo/:gameId", async (req, res) => {
  const gamesColl = await getCollection(connectToDB, "games");
  const gameDocument = await gamesColl.findOne({
    _id: new ObjectId(req.params.gameId),
  });
  res.json(gameDocument);
});

module.exports = router;

const express = require("express");
const { connectToDB } = require("../database");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../helpers/queryHelpers");

const router = express.Router();

router.get("/onlinePlayers", async (req, res) => {
    const playersColl = await getCollection(connectToDB, "players");
    const cursor = playersColl.find({ online: { $ne: false } });
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

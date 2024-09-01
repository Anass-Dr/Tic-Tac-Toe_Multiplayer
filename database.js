const { MongoClient } = require("mongodb");
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let dbConnection;

async function connectToDB() {
  try {
    if (!dbConnection) {
      await client.connect();
      console.log('Connected to MongoDB Atlas');
      dbConnection = client.db('Tic-Tac-Toe');
    }
    return dbConnection;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

module.exports = { connectToDB };
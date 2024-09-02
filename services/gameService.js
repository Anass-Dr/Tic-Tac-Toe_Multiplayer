const { connectToDB } = require("../database");
const { getCollection } = require("../helpers/queryHelpers");
const { ObjectId } = require("mongodb");

async function handleNewMove(gameId, moveIndex) {
  const gamesColl = await getCollection(connectToDB, "games");
  const gameDocument = await gamesColl.findOne({ _id: new ObjectId(gameId) });

  // Update Game infos
  if (!gameDocument) return null;
  gameDocument.nbOfMovements++;
  const pos = Math.floor(moveIndex / 20);
  gameDocument.movements[pos][moveIndex - pos * 20] = gameDocument.role;

  // Check for Win or Draw
  if (checkWin(moveIndex, gameDocument))
    gameDocument.results[gameDocument.role]++;
  else if (gameDocument.nbOfMovements === 400) gameDocument.results[2]++;

  // Change the role
  gameDocument.role = gameDocument.role === 0 ? 1 : 0;

  // Update Game Infos in db
  const result = await gamesColl.updateOne(
    { _id: new ObjectId(gameId) },
    { $set: gameDocument }
  );

  return gameDocument;
}

async function handleBoardReset(gameId) {
  const gamesColl = await getCollection(connectToDB, "games");
  const gameDocument = await gamesColl.findOne({ _id: new ObjectId(gameId) });

  // Update Game infos
  gameDocument.nbOfMovements = 0;
  gameDocument.movements = Array.from({ length: 20 }, () =>
    Array(20).fill(null)
  );

  // Update Game Infos in db
  const result = await gamesColl.updateOne(
    { _id: new ObjectId(gameId) },
    { $set: gameDocument }
  );

  return gameDocument;
}

function checkWin(i, gameDocument) {
  const rowNb = Math.floor(i / 20);
  const arrayIndex = i - rowNb * 20;

  // Check horizontal
  if (findMatch(gameDocument.movements[rowNb], gameDocument) === 5) return true;

  // Check vertical
  const verticalItems = gameDocument.movements.map((row) => row[arrayIndex]);
  if (findMatch(verticalItems, gameDocument) === 5) return true;

  // Check right angle
  const rightAngleItems = [gameDocument.movements[rowNb][arrayIndex]];
  let currRow = rowNb + 1;
  for (let x = arrayIndex - 1; x >= 0; x--) {
    if (currRow > 19) break;
    rightAngleItems.unshift(gameDocument.movements[currRow][x]);
    currRow++;
  }
  currRow = rowNb - 1;
  for (let x = arrayIndex + 1; x < 20; x++) {
    if (currRow < 0) break;
    rightAngleItems.push(gameDocument.movements[currRow][x]);
    currRow--;
  }
  if (findMatch(rightAngleItems, gameDocument) === 5) return true;

  // Check left angle
  const leftAngleItems = [gameDocument.movements[rowNb][arrayIndex]];
  currRow = rowNb + 1;
  for (let x = arrayIndex + 1; x < 20; x++) {
    if (currRow > 19) break;
    leftAngleItems.push(gameDocument.movements[currRow][x]);
    currRow++;
  }
  currRow = rowNb - 1;
  for (let x = arrayIndex - 1; x > 0; x--) {
    if (currRow < 0) break;
    leftAngleItems.unshift(gameDocument.movements[currRow][x]);
    currRow--;
  }
  if (findMatch(leftAngleItems, gameDocument) === 5) return true;

  return false;
}

const findMatch = (arr, gameDocument) => {
  let count = 0;
  for (let j = 0; j < 20; j++) {
    if (j + 4 === 20 || count === 5) break;
    for (let x = j; x < j + 5; x++) {
      if (arr[x] === gameDocument.role) {
        count++;
      } else {
        count = 0;
        break;
      }
    }
  }
  return count;
};

module.exports = { handleNewMove, handleBoardReset };

async function getCollection(connectToDB, collectionName) {
  const db = await connectToDB();
  return db.collection(collectionName);
}

module.exports = { getCollection };

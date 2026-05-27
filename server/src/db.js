const mongoose = require("mongoose");

let memoryServer = null;

async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    // Fall back to an in-process MongoDB so the app boots without external setup.
    // First boot can be slow if the MongoDB binary still needs to be downloaded.
    const { MongoMemoryServer } = require("mongodb-memory-server");
    console.log("[db] Starting in-memory MongoDB (first boot may download the MongoDB binary)…");
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: "onecrore" },
      binary: { downloadDir: require("path").join(__dirname, "..", ".mongo-binaries") }
    });
    uri = memoryServer.getUri();
    console.log("[db] Using in-memory MongoDB at", uri);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("[db] connected");
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDatabase, disconnectDatabase };

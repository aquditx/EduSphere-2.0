// index.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const progressRoutes = require('./routes/progress');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/progress';

const client = new MongoClient(MONGO_URI);

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(); // default db from URI
    const progressCollection = db.collection('progress');

    // Set the collection in the router
    progressRoutes.setCollection(progressCollection);

    app.get('/', (req, res) => {
      res.send('Progress Tracker Microservice is running!');
    });

    // Mount the router
    app.use('/', progressRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();

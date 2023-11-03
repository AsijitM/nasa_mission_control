const http = require('http');
const mongoose = require('mongoose');

require('dotenv').config();

const { app } = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');
const { error } = require('console');
const { mongoConnect } = require('./services/mongo');

const PORT = 8080;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

startServer();

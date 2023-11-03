const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.1 &&
    planet['koi_prad'] <= 1.6
  );
}

// pipe function connects a readable stream source to a writable stream destination

// here kepler_data is the source and the parse function is the destination

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data);
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`total habitablePlanets found is ${countPlanetsFound}`);
        console.log('Done!');
        resolve();
      });
  });
}

// parse();
function getAllPlanets() {
  return planets.find({});
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(err);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

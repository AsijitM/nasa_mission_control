const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchesWithId,
  abortLaunchById,
  scheduleNewLaunch,
} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (!launch.mission || !launch.rocket || !launch.launchDate) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }
  launch.launchDate = new Date(launch.launchDate); //parsing into date

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'invalid launch date!',
    });
  }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  const existsLaunch = await existsLaunchesWithId(launchId);
  // launch doesnt exists
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }
  // launch exists
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};

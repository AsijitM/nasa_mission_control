const request = require('supertest');
const { app } = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect()
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches') // this will be the testing api
        .expect(200) //the status code we are expecting
        .expect('Content-Type', /json/); //checking the headers in content-type. if it includes 'json'
    });
  });

  describe('Test POST /launches', () => {
    // define the post object
    const completeLaunchData = {
      mission: 'USS enterprise',
      rocket: 'NCC 1919',
      target: 'Kepler-62 f',
      launchDate: 'January 4,2028',
    };
    //post object without date
    const launchWithoutDate = {
      mission: 'USS enterprise',
      rocket: 'NCC 1919',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'USS enterprise',
      rocket: 'NCC 1919',
      target: 'Kepler-62 f',
      launchDate: 'zoot',
    };

    test('It should respond with 201 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf(); //convert into date
      const responseDate = new Date(response.body.launchDate).valueOf(); //convert into date
      expect(responseDate).toBe(requestDate); //now check if they are same or the expected result
      expect(response.body).toMatchObject(launchWithoutDate); //matching the incoming body object
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required fields', //copied from launches.controller.js
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'invalid launch date!', //copied from launches.controller.js
      });
    });
  });
});

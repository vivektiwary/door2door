const request = require("supertest");
const app = require("../../app").app;
const Vehicle = require("../../models/vehicle");
const Location = require("../../models/location");
const { setupDatabase, uniqid } = require("../fixtures/db");

beforeEach(setupDatabase);

it("should be able to create a new vehicle with given id", async () => {
  const r = await request(app)
    .post("/vehicles")
    .send({
      id: "abcd1234"
    })
    .expect(204);
});

it("should be able to delete the vehicle with given id", async () => {
  const vehicle = new Vehicle({ _id: uniqid() });
  await vehicle.save();

  const r = await request(app)
    .delete(`/vehicles/${vehicle._id}`)
    .send()
    .expect(204);

  const updatedVehicle = await Vehicle.findById(vehicle._id);
  expect(updatedVehicle.deleted).toBe(true);
});

describe("Adding location to Vehicle", () => {
  it("should be able to add locations for a given vehicle", async () => {
    const vehicle = new Vehicle({ _id: uniqid() });
    await vehicle.save();

    const locationParams = {
      lat: 52.52551,
      lng: 13.41377,
      at: new Date().toISOString()
    };

    const r = await request(app)
      .post(`/vehicles/${vehicle._id}/locations`)
      .send(locationParams)
      .expect(204);

    const count = await Location.count();
    expect(count).toBe(1);
  });
});

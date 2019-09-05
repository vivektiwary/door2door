require("../../app");
const Vehicle = require("../../models/vehicle");
const Location = require("../../models/location");
const { setupDatabase, uniqid } = require("../fixtures/db");

beforeEach(setupDatabase);

it("should be able to create a vehicle with given id", async () => {
  const vehicle = new Vehicle({ _id: uniqid() });
  await vehicle.save();

  const count = await Vehicle.count();
  expect(count).toBe(1);
});

describe("addLocation()", () => {
  let vehicle;
  let locationParams;
  beforeEach(async () => {
    vehicle = new Vehicle({ _id: uniqid() });
    await vehicle.save();

    // 52.52551 13.41377
    locationParams = {
      lat: 52.52551,
      lng: 13.41377,
      at: new Date().toISOString()
    };
    await vehicle.addLocation(
      locationParams.lat,
      locationParams.lng,
      locationParams.at
    );
  });

  it("should create a new location with vehicle id", async () => {
    const count = await Location.count();
    expect(count).toBe(1);

    const location = await Location.findOne();
    expect(location.vehicleId).toBe(vehicle._id);
  });

  it("should update the currentLocation", async () => {
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    const curLoc = await updatedVehicle.currentLocation();
    expect(curLoc.lat).toBe(locationParams.lat);
    expect(curLoc.lng).toBe(locationParams.lng);
    expect(curLoc.at.toISOString()).toBe(locationParams.at);
  });

  it("should update the lastLocation", async () => {
    const insideCityLoc = { lat: 52.52737, lng: 13.4509 };
    await vehicle.addLocation(
      insideCityLoc.lat,
      insideCityLoc.lng,
      locationParams.at
    );

    const updatedVehicle = await Vehicle.findById(vehicle._id);
    const curLoc = await updatedVehicle.lastLocation();

    expect(curLoc.lat).toBe(locationParams.lat);
    expect(curLoc.lng).toBe(locationParams.lng);
    expect(curLoc.at.toISOString()).toBe(locationParams.at);
  });

  it("should not create new location when the lat and lng is outsize of 3.5km radius", async () => {
    const outsideCityLoc = { lat: 52.4386, lng: 13.43957 };
    await vehicle.addLocation(
      outsideCityLoc.lat + 10,
      outsideCityLoc.lng + 10,
      locationParams.at
    );
    const count = await Location.count();
    expect(count).toBe(1); // we have created this in before each
  });
});

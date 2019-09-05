require("../../app");
const Location = require("../../models/location");
const { setupDatabase, uniqid } = require("../fixtures/db");

beforeEach(setupDatabase);

it("should be able to create a location with given vehicle id", async () => {
    const locationParams = {
        lat: 52.0,
        lng: 33.0,
        at: new Date().toISOString(),
        vehicleId: uniqid()
    };

    const location = new Location(locationParams);
    await location.save();

    const count = await Location.count();
    expect(count).toBe(1);
});

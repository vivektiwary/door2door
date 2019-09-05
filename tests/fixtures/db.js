const Vehicle = require("../../models/vehicle");
const Location = require("../../models/location");
const uniqid = require("uniqid");

const setupDatabase = async () => {
    await Location.deleteMany();
    await Vehicle.deleteMany();
};

module.exports = {
    setupDatabase,
    uniqid
};

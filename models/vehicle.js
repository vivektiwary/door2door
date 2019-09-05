const mongoose = require("mongoose");
const Location = require("./location");
const geolib = require('geolib');
const ObjectId = mongoose.Schema.Types.ObjectId;

const VehicleSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    currentLocationId: {
        type: ObjectId
    },
    lastLocationId: {
        type: ObjectId
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

VehicleSchema.methods.currentLocation = async function() {
    const location = await Location.findOne({
        _id: this.currentLocationId,
        vehicleId: this._id
    });
    return location;
};

VehicleSchema.methods.lastLocation = async function() {
    const location = await Location.findOne({
        _id: this.lastLocationId,
        vehicleId: this._id
    });
    return location;
};

VehicleSchema.methods.addLocation = async function(lat, lng, at) {
    const vehicle = await Vehicle.findById(this._id);
    const berlinCenter = {latitude: 52.53, longitude: 13.403}
    const distance = geolib.getDistance({latitude: lat, longitude: lng}, berlinCenter, 1)
    if (distance / 1000 > 3.5) {
        console.log('outside city bounds', lat, lng);
        return;
    }
    console.log('inside city bounds', lat, lng);
    const location = new Location({ lat, lng, at, vehicleId: vehicle._id });
    await location.save();

    if (vehicle.currentLocationId) {
        await this.updateOne({ lastLocationId: vehicle.currentLocationId });
    }
    await this.updateOne({ currentLocationId: location._id });
};

VehicleSchema.statics.vehiclesWithLocation = async () => {
    const vehicles = await Vehicle.find();
    const resObj = {};
    for (let i = 0, size = vehicles.length; i < size; i++) {
        const vehicle = vehicles[i];
        const currentLocation = await vehicle.currentLocation();
        const lastLocation = await vehicle.lastLocation();
        resObj[vehicle._id] = {
            currentLocation: currentLocation,
            lastLocation: lastLocation
        };
    }
    return resObj;
};

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

module.exports = Vehicle;

const mongoose = require("mongoose");

const Location = mongoose.model("Location", {
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    vehicleId: {
        type: String,
        required: true
    },
    at: {
        type: Date,
        required: true
    }
});

module.exports = Location;

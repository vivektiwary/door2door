const mongoose = require("mongoose");

/*
    Location model which stores the historical data as well as the current
    location data for a vehicle.
 */
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

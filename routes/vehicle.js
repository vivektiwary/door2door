const express = require("express");
const Vehicle = require("../models/vehicle");

const router = express.Router();

router.post("/", async (req, res) => {
    const vehicle = new Vehicle({ _id: req.body.id });
    try {
        await vehicle.save();
        res.io.emit("vehicleAdded", { id: vehicle._id });
        res.status(204).send();
    } catch (err) {
        console.log(err);
        res.status(422).send(err);
    }
});

router.post("/:id/locations", async (req, res) => {
    const { lat, lng, at } = req.body;

    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            deleted: false
        });

        await vehicle.addLocation(lat, lng, at);

        res.io.emit("locationUpdated", { lat, lng, vehicleId: vehicle._id });
        res.status(204).send();
    } catch (err) {
        console.log(err);
        res.status(422).send(err);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            deleted: false
        });
        await vehicle.updateOne({ deleted: true });
        res.status(204).send();
    } catch (err) {
        console.log("err: ", err);
        res.status(422).send(err);
    }
});

module.exports = router;

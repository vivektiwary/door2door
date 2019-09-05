const express = require("express");
const path = require("path");
const logger = require("morgan");

const vehicleRouter = require("./routes/vehicle");
const Vehicle = require("./models/vehicle");

require("./db/mongoose");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(logger("dev"));
app.use(function(req, res, next) {
    res.io = io;
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/vehicles", vehicleRouter);

io.on("connection", async socket => {
    const resObj = await Vehicle.vehiclesWithLocation();
    socket.emit("connectionSuccessful", { vehicles: resObj });
});

module.exports = { app: app, server: server };

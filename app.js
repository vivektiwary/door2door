const express = require("express");
const path = require("path");
const logger = require("morgan");
const { mongoConnected } = require("./db/mongoose");

const vehicleRouter = require("./routes/vehicle");
const Vehicle = require("./models/vehicle");

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
  const establishSocketConnection = async () => {
    const resObj = await Vehicle.vehiclesWithLocation();
    socket.emit("connectionSuccessful", { vehicles: resObj });
  };
  if (!mongoConnected) {
    setTimeout(establishSocketConnection, 5000); // This is being done because docker is not able to get connection for mongo instantaneously
  } else {
    await establishSocketConnection();
  }
});

module.exports = { app: app, server: server };

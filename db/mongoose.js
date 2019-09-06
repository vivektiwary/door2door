const mongoose = require("mongoose");

/*
    Connecting to the mongodb instance,
    MONGODB_URL will come from respective [env].env file. ex: config/dev.env
//  */
// const db = mongoose.connect(process.env.MONGODB_URL, {
//   useCreateIndex: true,
//   useNewUrlParser: true
// });
// db.catch(err => {
//   console.log(
//     "could not connect to the mongodb because of following errors: ",
//     err
//   );
// });

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: 30, // Retry up to 30 times
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0
};

// This is being done because of docker not connecting instantly

let mongoConnected = false;
const connectWithRetry = () => {
  console.log("MongoDB connection with retry");
  mongoose
    .connect(process.env.MONGODB_URL, options)
    .then(() => {
      console.log("MongoDB is connected");
      mongoConnected = true;
    })
    .catch(err => {
      console.log("MongoDB connection unsuccessful, retry after 5 seconds.");
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

module.exports = {
  mongoConnected
};

const mongoose = require("mongoose");

const db = mongoose.connect(process.env.MONGODB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true
});
db.catch(err => {
    console.log(
        "could not connect to the mongodb because of following errors: ",
        err
    );
});

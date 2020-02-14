const mongoose = require("mongoose")

mongoose
.connect(process.env.ONLINE_DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(db => console.log("MongoDB Connected"))
.catch(err => console.log("ERROR connecting to MongoDb", err));

module.exports = mongoose
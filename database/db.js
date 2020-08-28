const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_LOCAL,
  {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    }
    console.log("db connected");
  }
);

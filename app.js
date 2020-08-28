const express = require("express");
const hpp = require("hpp");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
require("express-async-errors");
const rateLimit = require("express-rate-limit");
const APIError = require("./utils/APIError");
const globalErrorHandler = require("./controllers/errorController");
require("./database/db");

// routers including
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const categoryRoute = require("./routes/category");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
const app = express();

app.use(limiter);
app.use(express.json({ limit: "20kb" }));
app.use(mongoSanitize());
app.use(helmet());
app.use(hpp());

app.use("/api/v1/users", userRoute);
app.use("/api/v1/posts", postRoute);
app.use("/api/v1/category", categoryRoute);

app.use((req, res, next) => {
  next(new APIError("no route found on this url", 404));
});

app.use(globalErrorHandler);

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`server is started on port ${port}`);
});

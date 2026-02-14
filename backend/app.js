const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error");
const connectDB = require("./utils/connectDB");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static("public"));

// Ensure database connection before handling API requests
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed. Please try again.",
    });
  }
});

// import routes
const post = require("./routes/postRoute");
const user = require("./routes/userRoute");
const chat = require("./routes/chatRoute");
const message = require("./routes/messageRoute");
const story = require("./routes/storyRoute");

app.use("/api/v1", post);
app.use("/api/v1", user);
app.use("/api/v1", chat);
app.use("/api/v1", message);
app.use("/api/v1", story);

// error middleware
app.use(errorMiddleware);

module.exports = app;

const express = require("express");
const app = express();
const cors = require("cors");
const env = require("dotenv");
const path = require("path");
const Database = require("./config/Dbconnection");
const UserRouter = require("./Router/user/userRouter");

env.config();
Database();

const Port = process.env.PORT || process.env.port || 7000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for convenience or specify exact domains
    }
  },
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check endpoint for Render deployment
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.json({ message: "Scrap Backend API is running successfully!" });
});

// Serve static assets and uploads
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount router on both / and /api
app.use("/", UserRouter);
app.use("/api", UserRouter);

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});

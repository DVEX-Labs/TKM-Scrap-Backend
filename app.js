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

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

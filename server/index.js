const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

require("./db_connect");

const Router = require("./routes/index");
const app = express();

// ✅ CORS Setup (allow empty origin for tools like Postman)
const whitelist = [
  "http://localhost:3000", // main frontend
  "http://localhost:4000", // admin panel
  "http://localhost:8000"  // backend
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Error: You are not authorized to access this API"));
    }
  },
};
app.use(cors(corsOptions));

// ✅ Middleware
app.use(express.json());
app.use("/public", express.static("public")); // for uploaded files (images, etc.)
app.use("/api", Router);

// ✅ Serve React Main Client
app.use("/", express.static(path.join(__dirname, "client/build")));
app.get(["/", "/shop/*", "/product/*", "/checkout", "/contact", "/login", "/register"], (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// ✅ Serve Admin Panel
app.use("/admin", express.static(path.join(__dirname, "admin/build")));
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin/build", "index.html"));
});

// ✅ Server Start
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

require("./db_connect");

const Router = require("./routes/index");
const app = express();

// CORS Setup
var whitelist = ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:4000'];
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error, You Are not authenticated to access this API'));
    }
  }
};
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// Public Files (uploads)
app.use("/public", express.static("public"));

// API Routes
app.use("/api", Router);

// ⚠️ Admin Static First (before client)
app.use('/admin', express.static(path.join(__dirname, 'admin/build')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/build', 'index.html'));
});

// ⚠️ Then serve Client Static
app.use('/', express.static(path.join(__dirname, 'client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start Server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

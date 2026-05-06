const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

require("./db_connect");

const Router = require("./routes/index");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* 🔥 ALLOWED ORIGINS (NO trailing slash) */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://shop-karo-ten.vercel.app",
  "https://shopkaro-sflc.onrender.com"
];

/* 🔥 CORS MIDDLEWARE */
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("CORS Not Allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

app.use(cors(corsOptions));

/* ✅ IMPORTANT: Handle preflight */
app.options("*", cors(corsOptions));

/* 🔥 SOCKET.IO SETUP */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* 🔥 SOCKET EVENTS */
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Joined room: ${roomId}`);
  });

  socket.on("sendMessage", ({ roomId, sender, text }) => {
    io.to(roomId).emit("receiveMessage", {
      sender,
      text,
      createdAt: new Date()
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

/* 🔥 MIDDLEWARE */
app.use(express.json());
app.use("/public", express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/invoices", express.static(path.join(__dirname, "public/invoices")));

/* 🔥 ROUTES */
app.use("/api", Router);

/* 🔥 SERVE FRONTEND (if deployed together) */
app.use("", express.static(path.join(__dirname, "client/build")));
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

/* 🔥 START SERVER */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
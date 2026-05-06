const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");   // ✅ import http
require("dotenv").config();

require("./db_connect");

const Router = require("./routes/index");
const { Server } = require("socket.io"); // ✅ import socket.io Server
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io to server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:8000", "http://localhost:4000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ✅ Socket.IO connection handler
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on("sendMessage", ({ roomId, sender, text }) => {
        io.to(roomId).emit("receiveMessage", { sender, text, createdAt: new Date() });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ✅ CORS whitelist (fix includes)
var whitelist = ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:4000','https://shop-karo-ten.vercel.app/','https://shopkaro-sflc.onrender.com'];
var corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {  // allow server-side or whitelist
            callback(null, true);
        } else {
            callback(new Error('CORS Error: Not authorized'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json());                     // parse incoming json data
app.use("/public", express.static("public"));           // optional
app.use("/uploads", express.static(path.join(__dirname, 'public/uploads')));
app.use("/invoices", express.static(path.join(__dirname, "public/invoices")))
app.use("/api", Router);

// Serve React frontend
app.use("", express.static(path.join(__dirname, "client/build")));
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

let port = process.env.PORT || 8000;
server.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.static("public")); // مجلد الملفات الأمامية

// صفحة رئيسية
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Socket.io للدردشة الحية
io.on("connection", (socket) => {
    console.log("📌 مستخدم متصل:", socket.id);

    socket.on("sendMessage", (msg) => {
        io.emit("receiveMessage", msg);
    });

    socket.on("disconnect", () => {
        console.log("📌 مستخدم قطع الاتصال:", socket.id);
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر شغال على المنفذ ${PORT}`));

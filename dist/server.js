"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = __importDefault(require("next"));
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const server = (0, http_1.createServer)((req, res) => {
        return handle(req, res);
    });
    // Initialize Socket.IO with more robust configuration
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000, // Increase ping timeout
        pingInterval: 25000, // Ping clients regularly
        transports: ['websocket', 'polling'] // Support both transport types
    });
    // Track connections for debugging
    let connections = 0;
    // Socket.IO connection handling
    io.on("connection", (socket) => {
        connections++;
        console.log(`Socket connected: ${socket.id} (Total connections: ${connections})`);
        // Respond to ping with pong to keep connection alive
        socket.on("ping", () => {
            socket.emit("pong");
        });
        // Handle new messages
        socket.on("new_message", (message) => {
            console.log(`New message in group ${message.groupId}:`, message.content);
            io.emit("message_received", message);
        });
        // Handle typing status
        socket.on("typing_status", (data) => {
            console.log(`Typing status: ${data.userId} is ${data.isTyping ? 'typing' : 'not typing'} in group ${data.groupId}`);
            socket.broadcast.emit("user_typing", data);
        });
        socket.on("disconnect", (reason) => {
            connections--;
            console.log(`Socket disconnected: ${socket.id}, reason: ${reason} (Total connections: ${connections})`);
        });
        // Send a welcome message to confirm connection
        socket.emit("connection_confirmed", {
            message: "Successfully connected to chat server",
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });
    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`> Server ready on http://localhost:${PORT}`);
        console.log(`> Socket.IO server initialized`);
    });
});

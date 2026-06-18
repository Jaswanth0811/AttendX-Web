"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Import routers
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const faculty_1 = __importDefault(require("./routes/faculty"));
const student_1 = __importDefault(require("./routes/student"));
// Database status checker
require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    },
});
// Expose Socket.io instance on express app object
app.set('io', io);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false // Disabled for easy development
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('Realtime: User connected to socket:', socket.id);
    socket.on('join_session', (sessionId) => {
        socket.join(sessionId);
        console.log(`Realtime: Socket ${socket.id} joined attendance session room ${sessionId}`);
    });
    socket.on('disconnect', () => {
        console.log('Realtime: User disconnected from socket:', socket.id);
    });
});
// App health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'API operational',
        timestamp: new Date().toISOString()
    });
});
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/faculty', faculty_1.default);
app.use('/api/student', student_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Express Error Handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
});

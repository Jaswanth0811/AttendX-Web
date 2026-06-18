import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Import routers
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import facultyRouter from './routes/faculty';
import studentRouter from './routes/student';

// Database status checker
import './db';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  },
});

// Expose Socket.io instance on express app object
app.set('io', io);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: false // Disabled for easy development
}));
app.use(morgan('dev'));
app.use(express.json());

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
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/student', studentRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

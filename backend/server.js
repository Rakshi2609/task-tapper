// backend/server.js
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.route.js';
import teamRoutes from './routes/team.route.js';
import communityRoutes from './routes/community.route.js';
import { connectDB } from './config/connectDB.js';
import { triggerDailySummaries } from './utils/triggerDailySummaries.js';
import { setupWorldChat } from './socket/worldChat.js';
import chatRoutes from './routes/chat.route.js';
import recurringTaskRoutes from './routes/recurrring.js';

dotenv.config();
const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: ['https://task-tapper-blush.vercel.app', 'http://localhost:5173'],
    credentials: true,
    // CORRECTED: Allow PUT and DELETE methods for Socket.io
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

setupWorldChat(io);

app.use(express.json());
// CORRECTED: Allow PUT and DELETE methods for the main Express app
app.use(cors({
  origin: ['https://task-tapper-blush.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// DB connection
connectDB();
app.use((req, res, next) => {
  req.io = io; 
  next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/function', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', recurringTaskRoutes);
app.use('/api/community', communityRoutes);

app.get('/', (req, res) => {
  res.send("Hello World!!");
  console.log("Listened");
});

app.get("/api/ping", async (req, res) => {
  console.log("✅ Pinged by GitHub Action at", new Date().toLocaleString());

  try {
    triggerDailySummaries(); 
    console.log("✅ Daily summary check initiated");
    res.send("✅ Ping success and summary check triggered");
  } catch (err) {
    console.error("❌ Error sending summary:", err.message);
    res.status(500).send("❌ Failed to send summary");
  }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
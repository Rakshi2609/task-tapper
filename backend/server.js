import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import teamRoutes from './routes/team.route.js';
import { connectDB } from './config/connectDB.js';
// import './taskScheduler.js'; 


dotenv.config();
const app = express();
app.use(express.json());

// app.use(cros()); 
app.use(cors({
  origin: process.env.CLIENT_URL,  // ✅ Only allow this origin
  credentials: true                 // ✅ Allow cookies/authorization headers
}));


const server = http.createServer(app); // ✅ Create HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

global.io = io;

connectDB();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/function', teamRoutes);
// app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send("Hello World!!");
  console.log("Listened")
});

// inside server.js or routes file
app.get("/api/ping", (req, res) => {
  console.log("✅ Pinged by GitHub Action at", new Date().toLocaleString());
  res.send("pong");
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (data) => {
    // data = { username, message }
    io.emit('receiveMessage', data); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});

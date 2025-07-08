import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import teamRoutes from './routes/team.route.js';
import { connectDB } from './config/connectDB.js';

dotenv.config();
const app = express();
const server = http.createServer(app); // ← required!

app.use(express.json());

// app.use(cors({
//   origin: ['https://task-tapper-blush.vercel.app', 'http://localhost:5173'],
//   credentials: true
// }));
// Automatically handle preflight requests using the same CORS config
app.use(cors({
  origin: ['https://task-tapper-blush.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'], // you can extend this if needed
}));


connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/function', teamRoutes);

app.get('/', (req, res) => {
  res.send("Hello World!!");
  console.log("Listened");
});

app.get("/api/ping", (req, res) => {
  console.log("✅ Pinged by GitHub Action at", new Date().toLocaleString());
  res.send("pong");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

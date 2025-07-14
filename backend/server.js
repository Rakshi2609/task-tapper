import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import teamRoutes from './routes/team.route.js';
import { connectDB } from './config/connectDB.js';
import { triggerDailySummaries } from './utils/triggerDailySummaries.js';


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

app.get("/api/ping", async (req, res) => {
  console.log("✅ Pinged by GitHub Action at", new Date().toLocaleString());

  try {
    triggerDailySummaries(); // Trigger daily summaries
    console.log("✅ Daily summary check initiated");
  } catch (err) {
    console.error("❌ Error sending summary:", err.message);
    res.status(500).send("❌ Failed to send summary");
  }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Route Handlers
import authRoutes from './routes/authRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/tracker', express.static(path.join(__dirname, '../tracker')));

// Rate Limiting Middleware to protect the analytics pipeline
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 150; // max 150 requests per IP per minute

const telemetryRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const timestamps = rateLimitMap.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
  }
  
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
};

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/track', telemetryRateLimiter, telemetryRoutes);
app.use('/api', analyticsRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

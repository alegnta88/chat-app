import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

import cors from 'cors';

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

connectDB();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',  authRoutes);
app.use('/api/messages',  messageRoutes);
app.use('/api/users',  userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
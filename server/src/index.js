import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint (Stage 1)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LinguaBuddy API'
  });
});

// Chat API Routes (Stage 2 - Gemma 4 Integration)
app.use('/api', chatRouter);

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`LinguaBuddy API server running on port ${PORT}`);
});

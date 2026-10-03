import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.listen(PORT, () => {
  console.log(`LinguaBuddy API server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import loginRoutes from './auth/login.js';
import { authMiddleware } from './auth/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.use('/api', loginRoutes);

app.get('/', (req, res) => {
  res.send('✅ Brickly backend flat attivo!');
});

app.get('/api/ping', authMiddleware, (req, res) => {
  res.json({
    messaggio: 'Accesso autorizzato!',
    utente: req.user
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});

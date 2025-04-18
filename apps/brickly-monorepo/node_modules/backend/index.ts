const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const loginRoutes = require('./auth/login');
const authMiddleware = require('./auth/authMiddleware').authMiddleware;
const { pool } = require('./db');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', loginRoutes);

// ✅ Rotta libera
app.get(
  '/',
  (req: import('express').Request, res: import('express').Response) => {
    res.send('✅ Brickly backend attivo!');
  }
);

// ✅ Rotta protetta /api/ping
app.get(
  '/api/ping',
  authMiddleware,
  (req: import('express').Request, res: import('express').Response) => {
    res.json({
      messaggio: 'Accesso autorizzato!',
      utente: (req as any).user
    });
  }
);

// ✅ Rotta protetta /api/condomini
app.get(
  '/api/condomini',
  authMiddleware,
  async (req: import('express').Request, res: import('express').Response) => {
    const id_studio = (req as any).user?.id_studio;

    try {
      const result = await pool.query(
        'SELECT * FROM condomini WHERE id_studio = $1 ORDER BY denominazione',
        [id_studio]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('❌ ERRORE QUERY CONDOMINI:', err); // <-- log dettagliato
      res.status(500).json({ errore: 'Errore interno nel recupero dei condomini' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});

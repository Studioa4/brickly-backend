import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM utenti_studio WHERE email = $1 AND attivo = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ errore: 'Email o password non validi' });
    }

    const utente = result.rows[0];
    const passwordOk = await bcrypt.compare(password, utente.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ errore: 'Email o password non validi' });
    }

    const token = jwt.sign(
      {
        id_utente: utente.id,
        id_studio: utente.id_studio,
        ruolo: utente.ruolo
      },
      process.env.JWT_SECRET || 'bricklysecret',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      utente: {
        id: utente.id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        ruolo: utente.ruolo,
        id_studio: utente.id_studio
      }
    });

  } catch (err) {
    console.error('Errore login:', err);
    res.status(500).json({ errore: 'Errore interno' });
  }
});

export = router;

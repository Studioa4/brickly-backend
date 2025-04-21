import { Router } from 'express'
import { pool } from '../db'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Configurazione nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Funzione per generare OTP
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// LOGIN: email + password → invio OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM utenti_studio WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user || user.password !== password) {
      return res.status(401).json({ errore: 'Credenziali non valide' })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minuti

    await pool.query(
      'UPDATE utenti_studio SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otp, expiresAt, user.id]
    )

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Il tuo codice OTP Brickly',
      text: `Il tuo codice OTP è: ${otp}`,
    })

    res.json({ mfa_required: true })
  } catch (err) {
    console.error('Errore login:', err)
    res.status(500).json({ errore: 'Errore durante l’accesso' })
  }
})

// VERIFICA OTP → emette JWT
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  try {
    const result = await pool.query('SELECT * FROM utenti_studio WHERE email = $1', [email])
    const user = result.rows[0]

    if (
      !user ||
      user.otp_code !== otp ||
      new Date(user.otp_expires_at) < new Date()
    ) {
      return res.status(401).json({ errore: 'Codice OTP non valido o scaduto' })
    }

    await pool.query(
      'UPDATE utenti_studio SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    )

    const token = jwt.sign(
      {
        id_utente: user.id,
        id_studio: user.id_studio,
        ruolo: user.ruolo,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      utente: {
        id: user.id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email,
        ruolo: user.ruolo,
        id_studio: user.id_studio,
      },
    })
  } catch (err) {
    console.error('Errore verifica OTP:', err)
    res.status(500).json({ errore: 'Errore nella verifica OTP' })
  }
})

export default router

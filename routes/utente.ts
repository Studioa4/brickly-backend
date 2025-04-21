import { Router } from 'express'
import { pool } from '../db'

const router = Router()

// GET /api/utente
router.get('/', async (req: any, res) => {
  const id_utente = req.user?.id_utente
  if (!id_utente) return res.status(401).json({ errore: 'Utente non autenticato' })

  try {
    const result = await pool.query(
      'SELECT email_notifiche, tema_preferito, lingua FROM utenti_studio WHERE id = $1',
      [id_utente]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('Errore GET /utente:', err)
    res.status(500).json({ errore: 'Errore interno' })
  }
})

// PUT /api/utente
router.put('/', async (req: any, res) => {
  const id_utente = req.user?.id_utente
  if (!id_utente) return res.status(401).json({ errore: 'Utente non autenticato' })

  const { email_notifiche, tema_preferito, lingua } = req.body

  try {
    await pool.query(
      `UPDATE utenti_studio SET email_notifiche = $1, tema_preferito = $2, lingua = $3 WHERE id = $4`,
      [email_notifiche, tema_preferito, lingua, id_utente]
    )
    res.json({ successo: true })
  } catch (err) {
    console.error('Errore PUT /utente:', err)
    res.status(500).json({ errore: 'Errore interno' })
  }
})

export default router

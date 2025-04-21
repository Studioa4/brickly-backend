import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import utenteRoutes from './routes/utente'
import uploadRoutes from './routes/upload'
import { authMiddleware } from './auth/authmiddleware'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Rotte pubbliche
app.use('/api', authRoutes)

// ✔️ Questo registra tutto come /api/upload
app.use('/api/upload', authMiddleware, uploadRoutes)

// Rotte protette
app.use('/utente', authMiddleware, utenteRoutes)
app.use('/upload', authMiddleware, uploadRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`)
})

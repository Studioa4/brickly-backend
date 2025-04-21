import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg
const isProduction = process.env.NODE_ENV === 'production'

const dbUrl = process.env.DB_BRICKLY_URL  // 👈 usa la variabile personalizzata

console.log('📦 Connessione BRICKLY DB:', dbUrl)

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
})

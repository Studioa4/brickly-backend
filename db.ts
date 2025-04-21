import pkg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// ✅ ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Carica .env dalla root del progetto
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
})

const { Pool } = pkg
const isProduction = process.env.NODE_ENV === 'production'

console.log('📦 Connessione BRICKLY DB:', process.env.DB_BRICKLY_URL)

export const pool = new Pool({
  connectionString: process.env.DB_BRICKLY_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
})

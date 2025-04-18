"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db_1.pool.query('SELECT * FROM utenti_studio WHERE email = $1 AND attivo = true', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ errore: 'Email o password non validi' });
        }
        const utente = result.rows[0];
        const passwordOk = await bcrypt_1.default.compare(password, utente.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ errore: 'Email o password non validi' });
        }
        const token = jsonwebtoken_1.default.sign({
            id_utente: utente.id,
            id_studio: utente.id_studio,
            ruolo: utente.ruolo
        }, process.env.JWT_SECRET || 'bricklysecret', { expiresIn: '8h' });
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
    }
    catch (err) {
        console.error('Errore login:', err);
        res.status(500).json({ errore: 'Errore interno' });
    }
});
module.exports = router;

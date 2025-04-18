"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const result = await db_1.pool.query('SELECT * FROM fornitori ORDER BY id');
    res.json(result.rows);
});
router.post('/', async (req, res) => {
    const { ragione_sociale, partita_iva, codice_fiscale, telefono, email, indirizzo, pec, iban, banca, note, codice_tributo, causale_cu } = req.body;
    const result = await db_1.pool.query('INSERT INTO fornitori (ragione_sociale, partita_iva, codice_fiscale, telefono, email, indirizzo, pec, iban, banca, note, codice_tributo, causale_cu) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *', [ragione_sociale, partita_iva, codice_fiscale, telefono, email, indirizzo, pec, iban, banca, note, codice_tributo, causale_cu]);
    res.status(201).json(result.rows[0]);
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { ragione_sociale, partita_iva, codice_fiscale, telefono, email, indirizzo, pec, iban, banca, note, codice_tributo, causale_cu } = req.body;
    const result = await db_1.pool.query('UPDATE fornitori SET ragione_sociale = $1, partita_iva = $2, codice_fiscale = $3, telefono = $4, email = $5, indirizzo = $6, pec = $7, iban = $8, banca = $9, note = $10, codice_tributo = $11, causale_cu = $12 WHERE id = $13 RETURNING *', [ragione_sociale, partita_iva, codice_fiscale, telefono, email, indirizzo, pec, iban, banca, note, codice_tributo, causale_cu, id]);
    res.json(result.rows[0]);
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db_1.pool.query('DELETE FROM fornitori WHERE id = $1', [id]);
    res.status(204).end();
});
exports.default = router;

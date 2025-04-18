import { config } from 'dotenv';
config(); // carica le variabili .env

import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PG_USER || '',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || '',
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10)
});

type FatturaData = {
  codice_fiscale_condominio: string;
  partita_iva: string;
  fornitore: string;
  numero_fattura: string;
  tipo_documento: string;
  data_fattura: string;
  importo: number;
  descrizione: string;
  pod?: string;
  ritenuta_acconto?: number;
  cassa_previdenza?: number;
  xml_file?: string;
};

export async function salvaFatturaNelDatabase(fattura: FatturaData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`🔍 Verifico condominio con CF: ${fattura.codice_fiscale_condominio}`);
    const condQuery = await client.query(
      'SELECT id FROM condomini WHERE codice_fiscale = $1',
      [fattura.codice_fiscale_condominio]
    );

    if (condQuery.rowCount === 0) {
      console.warn(`⚠️ Condominio non trovato: ${fattura.codice_fiscale_condominio}`);
      await client.query('ROLLBACK');
      return;
    }

    const condominio_id = condQuery.rows[0].id;

    console.log(`✅ Condominio trovato, ID: ${condominio_id}`);

    console.log(`🔍 Verifico fornitore con P.IVA: ${fattura.partita_iva}`);
    const fornitoreQuery = await client.query(
      'SELECT id FROM fornitori WHERE partita_iva = $1',
      [fattura.partita_iva]
    );

    if (fornitoreQuery.rowCount === 0) {
      console.log(`➕ Creo fornitore: ${fattura.fornitore}`);
      await client.query(
        'INSERT INTO fornitori (partita_iva, denominazione) VALUES ($1, $2)',
        [fattura.partita_iva, fattura.fornitore]
      );
    } else {
      console.log(`✅ Fornitore esistente`);
    }

    console.log(`💾 Inserisco fattura: ${fattura.numero_fattura}`);
    await client.query(
      `INSERT INTO fatture_elettroniche (
        condominio_id, fornitore, partita_iva, numero_fattura, tipo_documento,
        data_fattura, importo, descrizione, pod, ritenuta_acconto, cassa_previdenza,
        registrata, xml_file
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE, $12
      )`,
      [
        condominio_id, fattura.fornitore, fattura.partita_iva, fattura.numero_fattura,
        fattura.tipo_documento, fattura.data_fattura, fattura.importo, fattura.descrizione,
        fattura.pod || null, fattura.ritenuta_acconto || null, fattura.cassa_previdenza || null,
        fattura.xml_file || null
      ]
    );

    await client.query('COMMIT');
    console.log(`✅ Fattura salvata correttamente nel DB`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Errore durante il salvataggio nel DB:', error);
  } finally {
    client.release();
  }
}

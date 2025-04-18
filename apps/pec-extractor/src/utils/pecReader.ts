import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { estraiXmlConForge } from './p7mForge';
import { parseFatturaXml } from './xmlParser';
import { salvaFatturaNelDatabase } from '../services/salvaFattura';

config();

const imapConfig = {
  imap: {
    user: process.env.PEC_USER || '',
    password: process.env.PEC_PASSWORD || '',
    host: process.env.PEC_HOST || '',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 5000
  }
};

export async function readPECInbox() {
  const connection = await imaps.connect(imapConfig) as imaps.ImapSimple;
  await connection.openBox('INBOX');

  const searchCriteria = ['ALL'];
  const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };

  const messages = await connection.search(searchCriteria, fetchOptions);

  for (const item of messages) {
    const all = item.parts.find((part: any) => part.which === 'TEXT');
    if (!all) continue;

    const raw = all.body;
    const parsed = await simpleParser(raw);

    for (const attachment of parsed.attachments || []) {
      const filename = attachment.filename?.toLowerCase();
      if (!filename) continue;

      const savePath = path.resolve(__dirname, '../../tmp', filename);
      fs.writeFileSync(savePath, attachment.content);
      console.log(`📥 Allegato salvato: ${filename}`);

      let xmlPath = savePath;
      if (filename.endsWith('.p7m')) {
        const extracted = estraiXmlConForge(savePath);
        console.log('📂 XML estratto da .p7m:', extracted);
        if (extracted) xmlPath = extracted;
        else {
          console.warn(`⚠️ File .p7m non elaborabile: ${filename}`);
          continue;
        }
      }

      const dati = await parseFatturaXml(xmlPath);
      if (dati) {
        console.log('🧾 Dati estratti dalla fattura:', JSON.stringify(dati, null, 2));
        try {
          await salvaFatturaNelDatabase({
            codice_fiscale_condominio: dati.codice_fiscale_condominio,
            partita_iva: dati.partita_iva,
            fornitore: dati.fornitore,
            numero_fattura: dati.numero,
            tipo_documento: dati.tipoDocumento,
            data_fattura: dati.data,
            importo: parseFloat(dati.importo),
            descrizione: dati.descrizione,
            pod: dati.pod,
            ritenuta_acconto: 0,
            cassa_previdenza: 0,
            xml_file: path.basename(xmlPath)
          });
        } catch (err) {
          console.error('❌ Errore nel salvataggio della fattura:', err);
        }
      }
    }

    await connection.addFlags(item.attributes.uid, ['\\Seen']);
  }

  await connection.end();
  console.log("✅ Sincronizzazione completata.");
}

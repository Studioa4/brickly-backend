import fs from 'fs';
import path from 'path';
import { parseFatturaXml } from './xmlParser';
import { estraiXmlGrezzamente } from './p7mDecoder';
import { inviaEmailLogBatch } from './sendLogReport';

const baseDir = path.resolve(__dirname, '../../tmp');
const archiveDir = path.join(baseDir, 'archiviati');
const logPath = path.join(baseDir, 'log_batch.json');

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir);
}

async function processaFatture() {
  const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.xml') || f.endsWith('.p7m'));
  const log: any[] = [];

  for (const file of files) {
    const fullPath = path.join(baseDir, file);
    let xmlPath = fullPath;
    const result: any = { file, stato: '', messaggio: '' };

    try {
      if (file.endsWith('.p7m')) {
        const converted = estraiXmlGrezzamente(fullPath);
        if (!converted) {
          result.stato = 'scartato';
          result.messaggio = 'Errore estrazione XML da .p7m';
          log.push(result);
          continue;
        }
        xmlPath = converted;
      }

      const dati: any = await parseFatturaXml(xmlPath);
      if (!dati) {
        result.stato = 'scartato';
        result.messaggio = 'Parsing XML fallito';
        log.push(result);
        continue;
      }

      const fattura = {
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
      };

      const { salvaFatturaNelDatabase } = await import('../services/salvaFattura');
      await salvaFatturaNelDatabase(fattura);

      result.stato = 'salvata';
      result.messaggio = 'OK';

      // Sposta i file originali
      fs.renameSync(fullPath, path.join(archiveDir, path.basename(fullPath)));
      if (file.endsWith('.p7m')) {
        fs.renameSync(xmlPath, path.join(archiveDir, path.basename(xmlPath)));
      }

    } catch (err) {
      result.stato = 'errore';
      result.messaggio = (err as Error).message || 'Errore sconosciuto';
    }

    log.push(result);
  }

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf8');
  console.log(`📄 Log generato in: ${logPath}`);

  await inviaEmailLogBatch();
}

if (require.main === module) {
  processaFatture();
}

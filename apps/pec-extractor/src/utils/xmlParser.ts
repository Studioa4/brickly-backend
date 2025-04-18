import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

export async function parseFatturaXml(xmlPath: string) {
  if (!fs.existsSync(xmlPath)) {
    console.error("❌ File XML non trovato:", xmlPath);
    return null;
  }

  const xmlContent = fs.readFileSync(xmlPath, 'utf8');
  const result = await parseStringPromise(xmlContent, { explicitArray: false });

  try {
    const dati = result['p:FatturaElettronica'] || result['FatturaElettronica'];
    
    if (!dati || typeof dati !== 'object' || !dati.FatturaElettronicaHeader || !dati.FatturaElettronicaBody) {
    console.warn(`⚠️ Il file ${path.basename(xmlPath)} non è una fattura elettronica valida.`);
    return null;
}
    const header = dati.FatturaElettronicaHeader;
    const body = dati.FatturaElettronicaBody;

    const cedente = header.CedentePrestatore.DatiAnagrafici;
    const fornitore = cedente.Anagrafica.Denominazione || (cedente.Anagrafica.Nome + ' ' + cedente.Anagrafica.Cognome);
    const partita_iva = cedente.IdFiscaleIVA.IdCodice;

    const committente = header.CessionarioCommittente.DatiAnagrafici;
    const codice_fiscale_condominio = committente.CodiceFiscale;

    const data = body.DatiGenerali.DatiGeneraliDocumento.Data;
    const importo = body.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento;
    const tipoDocumento = body.DatiGenerali.DatiGeneraliDocumento.TipoDocumento;
    const numero = body.DatiGenerali.DatiGeneraliDocumento.Numero;

    const dettaglioLinee = body.DatiBeniServizi?.DettaglioLinee;
    const descrizioni = Array.isArray(dettaglioLinee)
      ? dettaglioLinee.map(linea => linea.Descrizione).join(' | ')
      : dettaglioLinee?.Descrizione || '';

    let pod = '';
    const altriDati = body?.Allegati?.AltriDatiGestionali || body?.DatiGenerali?.AltriDatiGestionali;
    if (altriDati) {
      const entries = Array.isArray(altriDati) ? altriDati : [altriDati];
      for (const dato of entries) {
        const tipo = (dato.TipoDato || '').toUpperCase();
        if (tipo.includes('POD')) {
          pod = dato.ValoreDato || dato.RiferimentoTesto || '';
          break;
        }
      }
    }

    return {
      fornitore,
      partita_iva,
      codice_fiscale_condominio,
      data,
      importo,
      descrizione: descrizioni,
      numero,
      tipoDocumento,
      pod
    };
  } catch (err) {
    console.error("❌ Errore durante il parsing del file XML:", err);
    return null;
  }
}

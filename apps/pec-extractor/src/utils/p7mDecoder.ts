import fs from 'fs';
import path from 'path';

export function estraiXmlGrezzamente(p7mPath: string): string | null {
  if (!fs.existsSync(p7mPath)) {
    console.error("❌ File .p7m non trovato:", p7mPath);
    return null;
  }

  const buffer = fs.readFileSync(p7mPath);
  const content = buffer.toString('utf8');

  const startIndex = content.indexOf('<?xml');
  if (startIndex === -1) {
    console.error("❌ Nessun blocco XML trovato nel file .p7m");
    return null;
  }

  const xml = content.substring(startIndex);
  const outputXmlPath = p7mPath.replace(/\.p7m$/i, '.xml');
  fs.writeFileSync(outputXmlPath, xml, 'utf8');

  console.log(`✅ XML estratto senza verifica firma: ${outputXmlPath}`);
  return outputXmlPath;
}

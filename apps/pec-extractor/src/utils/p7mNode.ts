import fs from 'fs';
import path from 'path';
import { fromP7m } from 'node-p7m';

export async function estraiXmlConNodeP7m(p7mPath: string): Promise<string | null> {
  try {
    const content = await fromP7m(fs.readFileSync(p7mPath));
    const xml = content.toString('utf8');
    const outputPath = p7mPath.replace(/\.p7m$/i, '.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`✅ XML estratto con node-p7m: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('❌ Errore durante la decodifica .p7m con node-p7m:', err.message);
    return null;
  }
}

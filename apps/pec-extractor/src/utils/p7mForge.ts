import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

export function estraiXmlConForge(p7mPath: string): string | null {
  try {
    const buffer = fs.readFileSync(p7mPath);
    const der = forge.util.createBuffer(buffer.toString('binary'));
    const asn1 = forge.asn1.fromDer(der);
    const p7 = forge.pkcs7.messageFromAsn1(asn1);

    let xml = '';
    if (typeof p7.content === 'string') {
      xml = p7.content;
    } else if (p7.content && 'getBytes' in p7.content) {
      xml = forge.util.decodeUtf8(p7.content.getBytes());
    } else {
      throw new Error('❌ Contenuto non disponibile o non supportato nel file .p7m');
    }

    const outputPath = p7mPath.replace(/\.p7m$/i, '.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    console.log(`✅ XML estratto con node-forge: ${outputPath}`);
    return outputPath;
  } catch (err: any) {
    console.error("❌ Errore durante l'estrazione con forge:", err.message);
    return null;
  }
}

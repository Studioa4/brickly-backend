const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function scaricaVisure(page) {
  const rows = await page.$$('table tbody tr');
  const skipped = [];

  console.log(`🔎 Trovati ${rows.length} subalterni.`);

  for (const row of rows) {
    const cols = await row.$$('td');
    const partitaText = await page.evaluate(el => el.innerText, cols[4]);
    const subText = await page.evaluate(el => el.innerText, cols[2]);

    if (/bene comune|soppresso/i.test(partitaText)) {
      const reason = `⏩ Subalterno ${subText} saltato (${partitaText})`;
      console.log(reason);
      skipped.push(reason);
      continue;
    }

    const checkbox = await row.$('input[type="checkbox"]');
    await checkbox.click();

    await Promise.all([
      page.click('input[name="visuraImm"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    await page.click('input[type="radio"][value="3"]');
    await Promise.all([
      page.click('input[name="inoltra"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    await page.click('input[name="metodo"][value="Salva"]');
    await page.waitForTimeout(3000);

    const downloadDir = path.resolve(__dirname, 'allegati');
    const files = fs.readdirSync(downloadDir);
    const newest = files.map(f => ({
      name: f,
      time: fs.statSync(path.join(downloadDir, f)).mtime.getTime()
    })).sort((a, b) => b.time - a.time)[0];

    const filePath = path.join(downloadDir, newest.name);
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    const foglio = text.match(/Foglio (\d+)/)?.[1] ?? 'X';
    const particella = text.match(/Particella (\d+)/)?.[1] ?? 'X';
    const subalterno = text.match(/Subalterno (\d+)/)?.[1] ?? subText;
    const comune = text.match(/Comune: (.+)/)?.[1]?.trim() ?? 'XXX';
    const sezione = text.match(/Sezione urbana: (\w+)/)?.[1] ?? 'NCT';

    const nomeFinale = `Visura fg. ${foglio} sez. urb. ${sezione} part. ${particella} sub. ${subalterno} di ${comune}.pdf`;
    const fileFinale = path.join(downloadDir, nomeFinale);

    fs.renameSync(filePath, fileFinale);
    console.log('📁 Salvato:', nomeFinale);

    await page.goBack({ waitUntil: 'networkidle2' });
    await page.goBack({ waitUntil: 'networkidle2' });
  }

  if (skipped.length) {
    fs.writeFileSync(path.join(__dirname, 'log_subalterni_saltati.txt'), skipped.join('\n'), 'utf-8');
    console.log('📝 Log creato: log_subalterni_saltati.txt');
  }

  console.log('✅ Visure scaricate e rinominate.');
}

module.exports = { scaricaVisure };

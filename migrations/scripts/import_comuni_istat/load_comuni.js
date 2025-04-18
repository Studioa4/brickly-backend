const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const comuniCsv = path.join(__dirname, 'elenco-comuni.csv');

fs.createReadStream(comuniCsv)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    console.log('Comune trovato:', row);
  })
  .on('end', () => {
    console.log('Importazione comuni completata.');
  });

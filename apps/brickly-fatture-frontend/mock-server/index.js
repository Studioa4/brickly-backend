const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());

const fatture = [
  {
    id: 1,
    condominio: "Via Roma 12",
    fornitore: "Enel Energia",
    partita_iva: "IT12345678901",
    numero_fattura: "FAT123",
    data_fattura: "2024-05-10",
    importo: 230.75,
    tipo_documento: "TD01",
    registrata: false,
    pod: "IT001E123456"
  },
  {
    id: 2,
    condominio: "Via Verdi 7",
    fornitore: "Studio A4 Group",
    partita_iva: "IT98765432109",
    numero_fattura: "CU2024",
    data_fattura: "2024-04-15",
    importo: 180.00,
    tipo_documento: "TD01",
    registrata: true,
    pod: ""
  }
];

app.get('/api/fatture-elettroniche', (req, res) => {
  res.json(fatture);
});

app.listen(port, () => {
  console.log(`✅ Mock server in ascolto su http://localhost:${port}`);
});

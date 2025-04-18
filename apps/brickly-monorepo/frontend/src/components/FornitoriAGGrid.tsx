import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

interface Fornitore {
  id: number;
  ragione_sociale: string;
  partita_iva: string;
  codice_fiscale: string;
  telefono: string;
  email: string;
  indirizzo: string;
  pec: string;
  iban: string;
  banca: string;
  note: string;
  codice_tributo: string;
  causale_cu: string;
}

const codiceTributoOptions = [
  "nessuna ritenuta",
  "1019 - Rit. acc. 4% - ditte individuali e società di persone",
  "1020 - Rit. acc. 4% - società di capitali",
  "1040 (ex 1038) - Rit. acc. 23% - provvigioni, commissioni di agenzia",
  "1040 - Rit. acc 20% - liberi professionisti"
];

const causaleCuOptions = [
  "nessuna causale",
  "A - prestazioni di lavoro autonomo",
  "M - prestaz. di lav. auton. non esercitate abitualmente",
  "O - prestaz. di lav. auton. non eserc. abitualm. senza obbligo gest. separata INPS",
  "O1 - redditi derivanti dall'assunzione di obblighi di fare, di non fare o permettere",
  "T - provvigioni corrisposte a mediatore",
  "W - prestazioni relative a contratti d'appalto",
  "XO - altro"
];

const FornitoriAGGrid: React.FC = () => {
  const [rowData, setRowData] = useState<Fornitore[]>([]);
  const [formData, setFormData] = useState<Partial<Fornitore> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fieldLabels: { [key: string]: string } = {
    ragione_sociale: 'Ragione Sociale',
    partita_iva: 'Partita IVA',
    codice_fiscale: 'Codice Fiscale',
    telefono: 'Telefono',
    email: 'Email',
    indirizzo: 'Indirizzo',
    pec: 'PEC',
    iban: 'IBAN',
    banca: 'Banca',
    note: 'Note',
    codice_tributo: 'Codice Tributo',
    causale_cu: 'Causa somme erogate (CU/770)'
  };

  const loadData = () => {
    axios.get<Fornitore[]>('http://localhost:3000/api/fornitori')
      .then((res) => setRowData(res.data))
      .catch((err) => console.error('Errore nel caricamento dei fornitori', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const columnDefs = Object.keys(fieldLabels).map((key) => ({
    field: key,
    headerName: fieldLabels[key],
    sortable: true,
    filter: true
  }));

  const handleDoubleClick = (params: any) => {
    setFormData({ ...params.data });
    setIsNew(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    const empty: Partial<Fornitore> = {};
    Object.keys(fieldLabels).forEach((key) => (empty[key] = ''));
    setFormData(empty);
    setIsNew(true);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData?.codice_fiscale || !formData?.ragione_sociale) {
      alert("Codice fiscale e Ragione sociale sono obbligatori.");
      return;
    }

    const endpoint = isNew
      ? axios.post('http://localhost:3000/api/fornitori', formData)
      : axios.put(`http://localhost:3000/api/fornitori/${formData.id}`, formData);

    endpoint.then(() => {
      loadData();
      setShowModal(false);
      setFormData(null);
    });
  };

  const handleDelete = () => {
    if (!formData?.id) return;
    const conferma = confirm("Vuoi davvero eliminare questo fornitore?");
    if (!conferma) return;

    axios.delete(`http://localhost:3000/api/fornitori/${formData.id}`)
      .then(() => {
        loadData();
        setShowModal(false);
        setFormData(null);
      });
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Aggiungi Fornitore
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={25}
          domLayout="autoHeight"
          onRowDoubleClicked={handleDoubleClick}
        />
      </div>

      {showModal && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-[800px] p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{isNew ? 'Nuovo Fornitore' : 'Modifica Fornitore'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(fieldLabels).map((key) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-semibold capitalize mb-1">{fieldLabels[key]}</label>
                  {key === 'codice_tributo' ? (
                    <select
                      name={key}
                      value={(formData as any)[key] || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    >
                      {codiceTributoOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : key === 'causale_cu' ? (
                    <select
                      name={key}
                      value={(formData as any)[key] || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    >
                      {causaleCuOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={(formData as any)[key] || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6">
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 font-semibold hover:underline"
                >
                  Elimina fornitore
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Salva
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FornitoriAGGrid;
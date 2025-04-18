import React, { useEffect, useState } from 'react';

export const FattureElettronichePage = () => {
  const [fatture, setFatture] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<'tutte' | 'da_registrare'>('da_registrare');

  useEffect(() => {
    fetch('/api/fatture-elettroniche')
      .then(res => res.json())
      .then(setFatture);
  }, []);

  const filtered = filtro === 'tutte' ? fatture : fatture.filter(f => !f.registrata);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Fatture Elettroniche</h1>

      <div className="flex items-center mb-4 gap-4">
        <label>
          <input type="radio" checked={filtro === 'da_registrare'} onChange={() => setFiltro('da_registrare')} />
          <span className="ml-2">Da registrare</span>
        </label>
        <label>
          <input type="radio" checked={filtro === 'tutte'} onChange={() => setFiltro('tutte')} />
          <span className="ml-2">Tutte</span>
        </label>
      </div>

      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Condominio</th>
            <th className="border p-2">Fornitore</th>
            <th className="border p-2">Data</th>
            <th className="border p-2">Importo</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => (
            <tr key={f.id}>
              <td className="border p-2">{f.condominio}</td>
              <td className="border p-2">{f.fornitore}</td>
              <td className="border p-2">{f.data_fattura}</td>
              <td className="border p-2">€ {f.importo.toFixed(2)}</td>
              <td className="border p-2">{f.tipo_documento}</td>
              <td className="border p-2">
                <button className="text-blue-600 hover:underline mr-2">Registra</button>
                <button className="text-gray-600 hover:underline mr-2">Visualizza XML</button>
                <button className="text-red-500 hover:underline">Archivia</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

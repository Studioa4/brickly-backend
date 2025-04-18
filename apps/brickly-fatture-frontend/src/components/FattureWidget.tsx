import React from 'react';

export const FattureWidget = ({ fatture }: { fatture: any[] }) => {
  const daRegistrare = fatture.filter(f => !f.registrata);

  return (
    <div className="border rounded-lg shadow p-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">Fatture da registrare</h2>
      {daRegistrare.length === 0 ? (
        <p className="text-sm text-gray-500">Nessuna fattura in attesa.</p>
      ) : (
        <ul className="space-y-1">
          {daRegistrare.slice(0, 5).map(f => (
            <li key={f.id} className="flex justify-between text-sm">
              <span>{f.fornitore} - {f.numero_fattura}</span>
              <span>€ {f.importo.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
      <button className="mt-3 text-blue-600 text-sm hover:underline">
        Visualizza tutto
      </button>
    </div>
  );
};

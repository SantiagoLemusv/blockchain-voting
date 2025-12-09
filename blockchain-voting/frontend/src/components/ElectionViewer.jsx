export default function ElectionViewer() {
  const elections = [
    { id: 1, name: "Elección de Representante", status: "Activa", votes: 45 },
    { id: 2, name: "Votación de Proyectos", status: "Finalizada", votes: 120 },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Elecciones Disponibles</h2>
      <div className="space-y-4">
        {elections.map((election) => (
          <div key={election.id} className="border rounded p-4 hover:shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{election.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm ${election.status === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {election.status}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              Total de votos: {election.votes}
            </p>
            <button className="mt-3 text-blue-600 hover:text-blue-800">
              Ver resultados →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
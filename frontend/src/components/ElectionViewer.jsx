export default function ElectionViewer({ elections }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Elecciones Disponibles</h2>
      <div className="space-y-4">
        {elections.length === 0 && (
          <p className="text-gray-500">Aún no hay elecciones creadas.</p>
        )}
        {elections.map((election) => (
          <div key={election.id} className="border rounded p-4 hover:shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{election.name}</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  election.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {election.isActive ? "Activa" : "Finalizada"}
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              Total de votos: {election.totalVotes}
            </p>
            <div className="mt-2 space-y-1">
              {election.options.map((opt, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-700">
                  <span>{opt}</span>
                  <span className="font-semibold">{election.votes[idx] || 0} votos</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

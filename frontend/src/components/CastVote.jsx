export default function CastVote() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Emitir Voto</h2>
      <p className="text-gray-600 mb-4">
        Selecciona una elección activa para votar
      </p>
      <select className="w-full border rounded p-2 mb-4">
        <option>Seleccionar elección...</option>
        <option>Elección de Representante</option>
        <option>Votación de Proyectos</option>
      </select>
      <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
        Emitir Voto
      </button>
    </div>
  );
}
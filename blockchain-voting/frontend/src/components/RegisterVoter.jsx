export default function RegisterVoter() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Registrar Votante</h2>
      <p className="text-gray-600 mb-4">
        Funcionalidad disponible solo para administradores
      </p>
      <button
        disabled
        className="w-full bg-gray-200 text-gray-500 py-2 rounded cursor-not-allowed"
      >
        Conectar como admin para habilitar
      </button>
    </div>
  );
}
import { useState } from "react";

export default function RegisterVoter({ isAdmin, onRegister }) {
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addr) return;
    setLoading(true);
    await onRegister(addr);
    setAddr("");
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Registrar Votante</h2>
      {!isAdmin && (
        <p className="text-gray-600 mb-4">
          Debes ser admin (owner del Registry) para registrar votantes.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="0x123..."
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={!isAdmin || loading}
        />
        <button
          type="submit"
          disabled={!isAdmin || loading}
          className={`w-full text-white px-4 py-2 rounded ${
            !isAdmin ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}

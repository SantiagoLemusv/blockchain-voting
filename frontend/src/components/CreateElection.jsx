import { useState } from "react";

export default function CreateElection({ isAdmin, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState("Opción A,Opción B");
  const [startMinutes, setStartMinutes] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({
      name,
      description,
      options: options.split(",").map((o) => o.trim()).filter(Boolean),
      startMinutes: Number(startMinutes),
      durationMinutes: Number(durationMinutes),
    });
    setLoading(false);
    setName("");
    setDescription("");
    setOptions("Opción A,Opción B");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Crear Elección</h2>
      {!isAdmin && (
        <p className="text-gray-600 mb-3">Solo el admin puede crear elecciones.</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Opciones separadas por coma"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-gray-700">
            Inicio en (min):
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={startMinutes}
              onChange={(e) => setStartMinutes(e.target.value)}
              disabled={!isAdmin || loading}
              min={1}
            />
          </label>
          <label className="text-sm text-gray-700">
            Duración (min):
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              disabled={!isAdmin || loading}
              min={5}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={!isAdmin || loading}
          className={`w-full text-white px-4 py-2 rounded ${
            !isAdmin ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Creando..." : "Crear elección"}
        </button>
      </form>
    </div>
  );
}

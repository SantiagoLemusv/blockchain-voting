import { useState } from "react";

export default function CreateElection({ isAdmin, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState("Opción A,Opción B");
  const [startMinutes, setStartMinutes] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [votingType, setVotingType] = useState("0");
  const [maxChoices, setMaxChoices] = useState(2);
  const [loading, setLoading] = useState(false);

  const optionCount = options.split(",").filter(Boolean).length;
  const isValid = !name || optionCount < 2;
  const isValidMaxChoices = votingType === "1" && (maxChoices < 2 || maxChoices > optionCount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid || isValidMaxChoices) return;
    setLoading(true);
    await onCreate({
      name,
      description,
      options: options.split(",").map((o) => o.trim()).filter(Boolean),
      startMinutes: Number(startMinutes),
      durationMinutes: Number(durationMinutes),
      votingType: Number(votingType),
      maxChoices: votingType === "1" ? Number(maxChoices) : 1,
    });
    setLoading(false);
    setName("");
    setDescription("");
    setOptions("Opción A,Opción B");
    setVotingType("0");
    setMaxChoices(2);
  };

  return (
    <div>
      <div className="flex-between">
        <h2 className="section-title">Crear elección</h2>
        <span className={isAdmin ? "badge badge-success" : "badge badge-muted"}>
          {isAdmin ? "Admin" : "Sólo admin"}
        </span>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Define nombre, descripción, opciones (separadas por coma) y tiempos.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          className="input"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <textarea
          className="textarea"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <div>
          <div className="small">Tipo de votación</div>
          <select
            className="select"
            value={votingType}
            onChange={(e) => setVotingType(e.target.value)}
            disabled={!isAdmin || loading}
          >
            <option value="0">Selección Única</option>
            <option value="1">Selección Múltiple</option>
          </select>
        </div>
        {votingType === "1" && (
          <div>
            <div className="small">Máximo de opciones (2-{optionCount})</div>
            <input
              type="number"
              className="input"
              value={maxChoices}
              onChange={(e) => setMaxChoices(e.target.value)}
              disabled={!isAdmin || loading}
              min={2}
              max={optionCount}
            />
            {isValidMaxChoices && (
              <p className="muted" style={{ color: "#f59e0b", marginTop: 4, fontSize: 12 }}>
                Las opciones deben estar entre 2 y {optionCount}
              </p>
            )}
          </div>
        )}
        <input
          className="input"
          placeholder="Opciones separadas por coma"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <div className="flex-between" style={{ gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="small">Inicio en (min)</div>
            <input
              type="number"
              className="input"
              value={startMinutes}
              onChange={(e) => setStartMinutes(e.target.value)}
              disabled={!isAdmin || loading}
              min={1}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="small">Duración (min)</div>
            <input
              type="number"
              className="input"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              disabled={!isAdmin || loading}
              min={5}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isAdmin || loading || isValid || isValidMaxChoices}
        >
          {loading ? "Creando..." : "Crear elección"}
        </button>
      </form>
    </div>
  );
}

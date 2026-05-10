import { useState } from "react";

function parseOptions(raw) {
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

function validateForm({ name, description, options, votingType, maxChoices }) {
  const errors = {};
  const parsed = parseOptions(options);

  if (!name.trim()) errors.name = "El nombre es obligatorio.";
  if (!description.trim()) errors.description = "La descripción es obligatoria.";

  if (parsed.length < 2) {
    errors.options = "Se requieren al menos 2 opciones separadas por coma.";
  } else {
    const hasEmpty = parsed.some((o) => o === "");
    if (hasEmpty) errors.options = "Ninguna opción puede estar vacía.";

    const unique = new Set(parsed.map((o) => o.toLowerCase()));
    if (unique.size < parsed.length) errors.options = "Hay opciones duplicadas.";
  }

  if (votingType === "1") {
    const mc = Number(maxChoices);
    if (!mc || mc < 2) {
      errors.maxChoices = "El máximo de opciones debe ser al menos 2.";
    } else if (mc > parsed.length) {
      errors.maxChoices = `No puede superar el número de opciones (${parsed.length}).`;
    }
  }

  return errors;
}

export default function CreateElection({ isAdmin, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState("Opción A,Opción B");
  const [startMinutes, setStartMinutes] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [votingType, setVotingType] = useState("0");
  const [maxChoices, setMaxChoices] = useState(2);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const optionCount = parseOptions(options).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm({ name, description, options, votingType, maxChoices });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      options: parseOptions(options),
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

  const field = (key) => ({
    className: `input${errors[key] ? " input-error" : ""}`,
  });

  return (
    <div>
      <div className="flex-between">
        <h2 className="section-title">Crear elección</h2>
        <span className={isAdmin ? "badge badge-success" : "badge badge-muted"}>
          {isAdmin ? "Admin" : "Sólo admin"}
        </span>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Define nombre, tipo, opciones y tiempos de la elección.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        {/* Nombre */}
        <div>
          <input
            {...field("name")}
            placeholder="Nombre de la elección *"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            disabled={!isAdmin || loading}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Descripción */}
        <div>
          <textarea
            className={`textarea${errors.description ? " input-error" : ""}`}
            placeholder="Descripción *"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })); }}
            disabled={!isAdmin || loading}
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>

        {/* Tipo de votación */}
        <div>
          <div className="small">Tipo de votación</div>
          <select
            className="select"
            value={votingType}
            onChange={(e) => { setVotingType(e.target.value); setErrors((p) => ({ ...p, maxChoices: "" })); }}
            disabled={!isAdmin || loading}
          >
            <option value="0">Selección Única</option>
            <option value="1">Selección Múltiple</option>
          </select>
        </div>

        {/* Max choices (condicional) */}
        {votingType === "1" && (
          <div>
            <div className="small">Máximo de opciones permitidas *</div>
            <input
              type="number"
              className={`input${errors.maxChoices ? " input-error" : ""}`}
              value={maxChoices}
              onChange={(e) => { setMaxChoices(e.target.value); setErrors((p) => ({ ...p, maxChoices: "" })); }}
              disabled={!isAdmin || loading}
              min={2}
              max={optionCount}
            />
            {errors.maxChoices && <span className="form-error">{errors.maxChoices}</span>}
          </div>
        )}

        {/* Opciones */}
        <div>
          <div className="small">Opciones separadas por coma *</div>
          <input
            {...field("options")}
            placeholder="Opción A, Opción B, Opción C"
            value={options}
            onChange={(e) => { setOptions(e.target.value); setErrors((p) => ({ ...p, options: "", maxChoices: "" })); }}
            disabled={!isAdmin || loading}
          />
          {errors.options && <span className="form-error">{errors.options}</span>}
          {!errors.options && optionCount >= 2 && (
            <span className="small" style={{ marginTop: 2, display: "block" }}>
              {optionCount} opciones detectadas
            </span>
          )}
        </div>

        {/* Tiempos */}
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
          disabled={!isAdmin || loading}
        >
          {loading ? "Creando..." : "Crear elección"}
        </button>
      </form>
    </div>
  );
}

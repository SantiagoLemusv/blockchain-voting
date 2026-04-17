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
    <div>
      <div className="flex-between">
        <h2 className="section-title">Registrar Votante</h2>
        <span className={isAdmin ? "badge badge-success" : "badge badge-muted"}>
          {isAdmin ? "Admin" : "Sólo admin"}
        </span>
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Ingresa la dirección de la cuenta que podrá votar.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          className="input"
          placeholder="0x123..."
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          disabled={!isAdmin || loading}
        />
        <button className="btn btn-primary" type="submit" disabled={!isAdmin || loading || !addr}>
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}

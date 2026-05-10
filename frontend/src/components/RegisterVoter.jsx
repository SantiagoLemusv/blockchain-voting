import { useState } from "react";
import { ethers } from "ethers";

export default function RegisterVoter({ isAdmin, onRegister }) {
  const [addr, setAddr] = useState("");
  const [addrError, setAddrError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateAddress = (value) => {
    if (!value.trim()) return "La dirección es obligatoria.";
    if (!ethers.isAddress(value.trim())) return "Dirección Ethereum inválida. Debe empezar con 0x y tener 42 caracteres.";
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setAddr(value);
    if (value) setAddrError(validateAddress(value));
    else setAddrError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateAddress(addr);
    if (err) { setAddrError(err); return; }
    setLoading(true);
    await onRegister(addr.trim());
    setAddr("");
    setAddrError("");
    setLoading(false);
  };

  const hasError = Boolean(addrError);

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
        <div>
          <input
            className={`input${hasError ? " input-error" : ""}`}
            placeholder="0x123..."
            value={addr}
            onChange={handleChange}
            disabled={!isAdmin || loading}
          />
          {hasError && <span className="form-error">{addrError}</span>}
        </div>
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!isAdmin || loading || !addr || hasError}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}

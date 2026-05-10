const FEATURES = [
  {
    icon: "🔒",
    title: "Seguridad total",
    desc: "Cada voto queda registrado en la blockchain. Imposible de alterar retroactivamente.",
  },
  {
    icon: "👁️",
    title: "Transparencia",
    desc: "Cualquier persona puede auditar los resultados en tiempo real. Código abierto y verificable.",
  },
  {
    icon: "⚡",
    title: "Resultados instantáneos",
    desc: "Sin esperas. Los votos se contabilizan automáticamente por el contrato inteligente.",
  },
  {
    icon: "🗳️",
    title: "Tipos de votación",
    desc: "Soporta selección única y selección múltiple. Flexible para distintos escenarios.",
  },
];

export default function LandingPage({ onConnect }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-badge">Plataforma Descentralizada · Ethereum</div>
        <h1 className="landing-title">
          Sistema de Votación <span className="landing-highlight">Blockchain</span>
        </h1>
        <p className="landing-desc">
          Emite y administra votos de manera transparente, segura e inmutable sobre la red Ethereum.
          Sin intermediarios. Sin alteraciones. Con auditoría pública en tiempo real.
        </p>
        <button className="btn btn-primary landing-cta" onClick={onConnect}>
          Conectar Wallet para votar →
        </button>
        <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          Requiere MetaMask u otra wallet compatible con EVM
        </p>
      </div>

      <div className="landing-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="landing-footer-note">
        <p className="muted" style={{ fontSize: 12 }}>
          Proyecto de tesis · Votación descentralizada con smart contracts Ethereum · Solidity 0.8.21 · Hardhat · React 18
        </p>
      </div>
    </div>
  );
}

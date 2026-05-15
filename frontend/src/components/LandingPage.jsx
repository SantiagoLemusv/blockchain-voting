const FEATURES = [
  {
    icon: "🔒",
    title: "Seguridad total",
    desc: "Cada voto queda registrado de forma inmutable. Imposible de alterar retroactivamente.",
  },
  {
    icon: "🔐",
    title: "Tu voto es privado",
    desc: "Nadie puede ver qué opción elegiste. Solo se registra que participaste.",
  },
  {
    icon: "⚡",
    title: "Resultados instantáneos",
    desc: "Sin esperas. Los votos se contabilizan automáticamente y puedes ver el avance en tiempo real.",
  },
  {
    icon: "👁️",
    title: "Auditoría abierta",
    desc: "Cualquier persona puede verificar la integridad del proceso. Sin trampas, sin manipulación.",
  },
];

export default function LandingPage({ onConnect }) {
  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="landing-badge">Plataforma de Votación Segura</div>
        <h1 className="landing-title">
          Tu voto cuenta. <span className="landing-highlight">Y nadie puede cambiarlo.</span>
        </h1>
        <p className="landing-desc">
          Una plataforma moderna para emitir y administrar votos de forma transparente, segura
          y verificable. Tu participación queda protegida criptográficamente.
        </p>
        <button className="btn btn-primary landing-cta" onClick={onConnect}>
          Iniciar votación →
        </button>
        <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          Te pediremos autenticarte de forma segura con tu billetera digital
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
          Plataforma adaptable de votación descentralizada · Proyecto académico
        </p>
      </div>
    </div>
  );
}

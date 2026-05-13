/**
 * Sidebar admin — UI-05
 *
 * Menú lateral con secciones: Resumen, Votaciones, Usuarios, Auditoría, Resultados.
 */

const SECTIONS = [
  { id: "resumen", label: "Resumen", icon: "📊", description: "Métricas y actividad" },
  { id: "votaciones", label: "Votaciones", icon: "🗳️", description: "Crear y gestionar" },
  { id: "usuarios", label: "Usuarios", icon: "👥", description: "Registrar votantes" },
  { id: "auditoria", label: "Auditoría", icon: "🔍", description: "Bitácora pública" },
  { id: "resultados", label: "Resultados", icon: "📈", description: "Conteo por elección" },
];

export default function Sidebar({ activeSection, onSelectSection }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-title">Panel Administrador</div>
        <p className="admin-sidebar-subtitle">Gestión completa del sistema</p>
      </div>

      <nav className="admin-sidebar-nav">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            className={`admin-sidebar-item${activeSection === sec.id ? " active" : ""}`}
            onClick={() => onSelectSection(sec.id)}
          >
            <span className="admin-sidebar-icon">{sec.icon}</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div className="admin-sidebar-label">{sec.label}</div>
              <div className="admin-sidebar-desc">{sec.description}</div>
            </div>
            {activeSection === sec.id && <span className="admin-sidebar-active-bar" />}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="small" style={{ fontSize: 11 }}>
          🛡️ Sesión activa como administrador
        </div>
      </div>
    </aside>
  );
}

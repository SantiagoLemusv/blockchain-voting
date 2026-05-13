import { useState } from "react";
import Sidebar from "./Sidebar";
import SectionResumen from "./SectionResumen";
import SectionVotaciones from "./SectionVotaciones";
import SectionUsuarios from "./SectionUsuarios";
import SectionAuditoria from "./SectionAuditoria";
import SectionResultados from "./SectionResultados";

export default function AdminLayout({
  elections,
  totalVoters,
  onRegister,
  onCreate,
  onSelectElection,
  activityLog,
}) {
  const [activeSection, setActiveSection] = useState("resumen");

  const renderSection = () => {
    switch (activeSection) {
      case "resumen":
        return (
          <SectionResumen
            elections={elections}
            totalVoters={totalVoters}
            activityLog={activityLog}
            onSelectElection={onSelectElection}
            onNavigateSection={setActiveSection}
          />
        );
      case "votaciones":
        return <SectionVotaciones elections={elections} onCreate={onCreate} onSelectElection={onSelectElection} />;
      case "usuarios":
        return <SectionUsuarios onRegister={onRegister} totalVoters={totalVoters} />;
      case "auditoria":
        return <SectionAuditoria />;
      case "resultados":
        return <SectionResultados elections={elections} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
      <div className="admin-content">{renderSection()}</div>
    </div>
  );
}

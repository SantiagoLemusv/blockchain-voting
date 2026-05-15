import AuditPanel from "../AuditPanel";

export default function SectionAuditoria() {
  // En el panel admin SIEMPRE es admin (esta sección solo se renderiza para admins)
  return <AuditPanel isAdmin={true} />;
}

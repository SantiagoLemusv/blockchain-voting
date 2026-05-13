import ElectionViewer from "../ElectionViewer";

export default function SectionResultados({ elections }) {
  return (
    <div>
      <h2 className="section-title">📈 Resultados de elecciones</h2>
      <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>
        Conteo en tiempo real por candidato. Los datos provienen directamente de los contratos blockchain.
      </p>
      <ElectionViewer elections={elections} />
    </div>
  );
}

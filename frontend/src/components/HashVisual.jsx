/**
 * HashVisual — representación visual determinística de un hash criptográfico.
 *
 * Genera un patrón geométrico simétrico (5x5) con colores extraídos del hash.
 * Mismo hash = misma figura, siempre.
 *
 * Sin dependencias: solo SVG nativo.
 */

function hashToInt(hash, idx, len = 2) {
  const clean = hash.replace(/^0x/, "");
  return parseInt(clean.slice(idx * len, (idx + 1) * len) || "0", 16);
}

function pickColor(hash, idx) {
  const hue = (hashToInt(hash, idx) * 360) / 256;
  const sat = 60 + (hashToInt(hash, idx + 1) % 30);
  const light = 45 + (hashToInt(hash, idx + 2) % 15);
  return `hsl(${Math.floor(hue)}, ${sat}%, ${light}%)`;
}

export default function HashVisual({ hash, size = 48, rounded = true }) {
  if (!hash || typeof hash !== "string") {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "var(--bg)",
          borderRadius: rounded ? 8 : 0,
          display: "inline-block",
        }}
      />
    );
  }

  const clean = hash.replace(/^0x/, "").padEnd(64, "0");
  const cellSize = size / 5;

  // Color principal + secundario derivados del hash
  const primary = pickColor(clean, 0);
  const secondary = pickColor(clean, 3);
  const bg = `hsl(${(hashToInt(clean, 6) * 360) / 256}, 25%, 96%)`;

  // Construir grid 5x5 simétrico (mirror izquierda/derecha)
  const cells = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const cellIdx = y * 3 + x;
      const byteVal = hashToInt(clean, 8 + cellIdx);
      const filled = byteVal % 2 === 0;
      const useSecondary = byteVal % 5 === 0;
      const color = filled ? (useSecondary ? secondary : primary) : "transparent";

      cells.push({ x, y, color });
      if (x < 2) {
        cells.push({ x: 4 - x, y, color });
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        borderRadius: rounded ? 8 : 0,
        background: bg,
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
      }}
      aria-label={`Huella visual del hash ${hash.slice(0, 10)}`}
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x * cellSize}
          y={c.y * cellSize}
          width={cellSize}
          height={cellSize}
          fill={c.color}
        />
      ))}
    </svg>
  );
}

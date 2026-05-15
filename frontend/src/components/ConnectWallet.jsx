import HashVisual from "./HashVisual";

export default function ConnectWallet({ account, onConnect }) {
  const formatAddress = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div>
      {account ? (
        <div
          className="wallet-connected"
          title={`Sesión activa · ${account}`}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <HashVisual hash={account} size={24} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
              Sesión activa
            </span>
            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>
              {formatAddress(account)}
            </span>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onConnect}>
          Iniciar sesión segura
        </button>
      )}
    </div>
  );
}

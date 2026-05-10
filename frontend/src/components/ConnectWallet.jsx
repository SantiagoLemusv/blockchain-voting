export default function ConnectWallet({ account, onConnect }) {
  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div>
      {account ? (
        <div className="wallet-connected">
          <div className="wallet-dot" />
          <span>{formatAddress(account)}</span>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onConnect}>
          Conectar Wallet
        </button>
      )}
    </div>
  );
}

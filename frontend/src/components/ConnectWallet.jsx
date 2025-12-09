export default function ConnectWallet({ account, onConnect }) {
  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  return (
    <div className="mt-4">
      {account ? (
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <span className="mr-2">🟢</span>
          <span className="font-medium">{formatAddress(account)}</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Conectar Wallet
        </button>
      )}
    </div>
  );
}
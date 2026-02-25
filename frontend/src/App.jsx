import { useState, useEffect } from "react";
import ConnectWallet from "./components/ConnectWallet";
import RegisterVoter from "./components/RegisterVoter";
import CreateElection from "./components/CreateElection";
import CastVote from "./components/CastVote";
import ElectionViewer from "./components/ElectionViewer";
import { getContract, ensureNetwork } from "./utils/web3";
import { registryAbi } from "./abi/registry";
import { votingAbi } from "./abi/voting";

const REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_REGISTRY_ADDRESS;
const VOTING_ADDRESS = import.meta.env.VITE_CONTRACT_VOTING_ADDRESS;

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [registry, setRegistry] = useState(null);
  const [voting, setVoting] = useState(null);
  const [elections, setElections] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loadingVote, setLoadingVote] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => connectWallet());
      window.ethereum.on("chainChanged", () => connectWallet());
    }
    // auto-connect if already authorized
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return;
    await ensureNetwork("sepolia");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const addr = accounts[0];
    setAccount(addr);
    await loadContracts();
  };

  const loadContracts = async () => {
    if (!REGISTRY_ADDRESS || !VOTING_ADDRESS) {
      console.warn("Faltan direcciones en frontend/.env");
      return;
    }
    const reg = await getContract(REGISTRY_ADDRESS, registryAbi);
    const vot = await getContract(VOTING_ADDRESS, votingAbi);
    setRegistry(reg);
    setVoting(vot);

    const owner = await reg.owner();
    setIsAdmin(owner.toLowerCase() === (await reg.runner.getAddress()).toLowerCase());

    await refreshData(reg, vot);
  };

  const refreshData = async (reg, vot) => {
    if (!reg || !vot) return;
    const total = await reg.getTotalRegistered();
    setTotalVoters(Number(total));

    const next = Number(await vot.nextElectionId());
    const items = [];
    for (let id = 1; id < next; id++) {
      const info = await vot.getElectionInfo(id);
      if (!info.exists) continue;
      const results = await vot.getElectionResults(id);
      items.push({
        id,
        name: info.name,
        description: info.description,
        startTime: Number(info.startTime),
        endTime: Number(info.endTime),
        totalVotes: Number(results.totalVotes),
        options: results.options,
        votes: results.votes.map((v) => Number(v)),
        isActive: results.isActive,
      });
    }
    setElections(items);
  };

  const handleRegister = async (addr) => {
    const tx = await registry.registerVoter(addr);
    await tx.wait();
    await refreshData(registry, voting);
  };

  const handleCreateElection = async ({ name, description, options, startMinutes, durationMinutes }) => {
    const latest = await voting.runner.provider.getBlock("latest");
    const startTime = Number(latest.timestamp) + startMinutes * 60;
    const duration = durationMinutes * 60;
    const tx = await voting.createElection(name, description, options, startTime, duration);
    await tx.wait();
    await refreshData(registry, voting);
  };

  const handleVote = async (electionId, option) => {
    setLoadingVote(true);
    const tx = await voting.vote(electionId, option);
    await tx.wait();
    await refreshData(registry, voting);
    setLoadingVote(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗳️ Sistema de Votación Blockchain</h1>
            <p className="text-gray-600 text-sm">
              Red: Sepolia | Votantes registrados: {totalVoters}
            </p>
          </div>
          <ConnectWallet account={account} onConnect={connectWallet} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!account ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Conecta tu wallet para comenzar</h2>
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Conectar MetaMask
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <RegisterVoter isAdmin={isAdmin} onRegister={handleRegister} />
              <CreateElection isAdmin={isAdmin} onCreate={handleCreateElection} />
              <CastVote elections={elections} onVote={handleVote} loadingVote={loadingVote} />
            </div>
            <div className="lg:col-span-2">
              <ElectionViewer elections={elections} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

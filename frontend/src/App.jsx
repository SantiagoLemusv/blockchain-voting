import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConnectWallet from "./components/ConnectWallet";
import RegisterVoter from "./components/RegisterVoter";
import CreateElection from "./components/CreateElection";
import CastVote from "./components/CastVote";
import ElectionViewer from "./components/ElectionViewer";
import { getContract, ensureNetwork } from "./utils/web3";
import { registryAbi } from "./abi/registry";
import { factoryAbi } from "./abi/factory";
import { electionAbi } from "./abi/election";

const REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_REGISTRY_ADDRESS;
const FACTORY_ADDRESS = import.meta.env.VITE_CONTRACT_FACTORY_ADDRESS;
const NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [registry, setRegistry] = useState(null);
  const [factory, setFactory] = useState(null);
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
    await ensureNetwork(NETWORK);
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const addr = accounts[0];
    setAccount(addr);
    await loadContracts();
  };

  const loadContracts = async () => {
    if (!REGISTRY_ADDRESS || !FACTORY_ADDRESS) {
      console.error("❌ Faltan VITE_CONTRACT_REGISTRY_ADDRESS o VITE_CONTRACT_FACTORY_ADDRESS en frontend/.env");
      setAccount("ERROR");
      return;
    }
    const reg = await getContract(REGISTRY_ADDRESS, registryAbi);
    const fac = await getContract(FACTORY_ADDRESS, factoryAbi);
    setRegistry(reg);
    setFactory(fac);

    const owner = await reg.owner();
    setIsAdmin(owner.toLowerCase() === (await reg.runner.getAddress()).toLowerCase());

    await refreshData(reg, fac);
  };

  const refreshData = async (reg, fac) => {
    if (!reg || !fac) return;
    const total = await reg.getTotalRegistered();
    setTotalVoters(Number(total));

    const addresses = await fac.getElections();
    const items = [];
    for (let idx = 0; idx < addresses.length; idx++) {
      const addr = addresses[idx];
      const election = await getContract(addr, electionAbi);
      const [name, description, startTime, endTime, active] = await Promise.all([
        election.name(),
        election.description(),
        election.startTime(),
        election.endTime(),
        election.isActive(),
      ]);
      const candidates = await election.getCandidates();
      const totalVotes = await election.totalVotes();
      items.push({
        id: idx + 1,
        address: addr,
        name,
        description,
        startTime: Number(startTime),
        endTime: Number(endTime),
        totalVotes: Number(totalVotes),
        options: candidates.map((c) => c.name),
        votes: candidates.map((c) => Number(c.votes)),
        isActive: active,
      });
    }
    setElections(items);
  };

  const handleRegister = async (addr) => {
    try {
      const tx = await registry.registerVoter(addr);
      await tx.wait();
      await refreshData(registry, factory);
      toast.success("✅ Votante registrado");
    } catch (err) {
      console.error(err);
      toast.error(`❌ Error: ${err.message || "No se pudo registrar"}`);
    }
  };

  const handleCreateElection = async ({ name, description, options, startMinutes, durationMinutes }) => {
    try {
      const latest = await factory.runner.provider.getBlock("latest");
      const startTime = Number(latest.timestamp) + startMinutes * 60;
      const endTime = startTime + durationMinutes * 60;
      const tx = await factory.createElection(name, description, options, startTime, endTime);
      await tx.wait();
      await refreshData(registry, factory);
      toast.success("✅ Elección creada");
    } catch (err) {
      console.error(err);
      toast.error(`❌ Error: ${err.message || "No se pudo crear elección"}`);
    }
  };

  const handleVote = async (electionAddress, option) => {
    setLoadingVote(true);
    try {
      const election = await getContract(electionAddress, electionAbi);
      const tx = await election.vote(option);
      await tx.wait();
      await refreshData(registry, factory);
      toast.success("✅ Voto registrado");
    } catch (err) {
      console.error(err);
      toast.error(`❌ Error: ${err.message || "No se pudo votar"}`);
    } finally {
      setLoadingVote(false);
    }
  };

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={4000} />
      <header className="app-header">
        <div>
          <h1 className="app-title">🗳️ Sistema de Votación</h1>
          <p className="app-subtitle">Red: {NETWORK} · Votantes: {totalVoters}</p>
        </div>
        <ConnectWallet account={account} onConnect={connectWallet} />
      </header>

      <main className="layout">
        {!account ? (
          <div className="card" style={{ textAlign: "center" }}>
            <h2 className="section-title">Conecta tu wallet</h2>
            <p className="muted">Necesitas una wallet para interactuar con el sistema.</p>
            <button className="btn btn-primary" onClick={connectWallet} style={{ marginTop: 12 }}>
              Conectar MetaMask
            </button>
          </div>
        ) : (
          <div className="grid">
            <div className="card">
              <RegisterVoter isAdmin={isAdmin} onRegister={handleRegister} />
            </div>
            <div className="card">
              <CreateElection isAdmin={isAdmin} onCreate={handleCreateElection} />
            </div>
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <CastVote elections={elections} onVote={handleVote} loadingVote={loadingVote} />
            </div>
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <ElectionViewer elections={elections} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

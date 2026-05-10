import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConnectWallet from "./components/ConnectWallet";
import AdminDashboard from "./components/AdminDashboard";
import CastVote from "./components/CastVote";
import ElectionViewer from "./components/ElectionViewer";
import LandingPage from "./components/LandingPage";
import ElectionDetailModal from "./components/ElectionDetailModal";
import { getContract, ensureNetwork } from "./utils/web3";
import { registryAbi } from "./abi/registry";
import { factoryAbi } from "./abi/factory";
import { electionAbi } from "./abi/election";

const REGISTRY_ADDRESS = import.meta.env.VITE_CONTRACT_REGISTRY_ADDRESS;
const FACTORY_ADDRESS = import.meta.env.VITE_CONTRACT_FACTORY_ADDRESS;
const NETWORK = import.meta.env.VITE_NETWORK || "sepolia";

const getHumanError = (err) => {
  const msg = err.message || err.reason || err.data?.message || "";
  if (msg.includes("Start must be future")) return "La elección debe comenzar en el futuro. Usa al menos 5 minutos.";
  if (msg.includes("Already voted")) return "Esta cuenta ya votó en esta elección.";
  if (msg.includes("Not authorized")) return "No estás registrado como votante.";
  if (msg.includes("Not owner")) return "Solo el admin puede realizar esta acción.";
  if (msg.includes("Already registered")) return "Este votante ya está registrado.";
  if (msg.includes("Election not started")) return "La elección aún no ha comenzado.";
  if (msg.includes("Election ended")) return "La elección ha finalizado.";
  if (msg.includes("Invalid candidate")) return "Opción de voto inválida.";
  if (msg.includes("Wrong voting type")) return "Tipo de votación incorrecto para esta elección.";
  if (msg.includes("Too many choices")) return "Has seleccionado demasiadas opciones.";
  if (msg.includes("Duplicate candidate")) return "No puedes seleccionar la misma opción dos veces.";
  if (msg.includes("Must select at least one")) return "Debes seleccionar al menos una opción.";
  if (msg.includes("user rejected")) return "Transacción rechazada en MetaMask.";
  return msg.slice(0, 120) || "Error desconocido. Intenta de nuevo.";
};

function App() {
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [registry, setRegistry] = useState(null);
  const [factory, setFactory] = useState(null);
  const [elections, setElections] = useState([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loadingVote, setLoadingVote] = useState(false);
  const [activeTab, setActiveTab] = useState("vote");
  const [selectedElection, setSelectedElection] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const logActivity = (type, payload = {}) => {
    setActivityLog((prev) => [...prev.slice(-49), { type, payload, timestamp: new Date() }]);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => connectWallet());
      window.ethereum.on("chainChanged", () => connectWallet());
    }
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
      const [name, description, startTime, endTime, active, votingType, maxChoices] = await Promise.all([
        election.name(),
        election.description(),
        election.startTime(),
        election.endTime(),
        election.isActive(),
        election.votingType(),
        election.maxChoices(),
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
        votingType: Number(votingType),
        maxChoices: Number(maxChoices),
      });
    }
    setElections(items);
  };

  const handleRegister = async (addr) => {
    try {
      const tx = await registry.registerVoter(addr);
      await tx.wait();
      await refreshData(registry, factory);
      logActivity("voter_registered", { name: addr });
      toast.success("✅ Votante registrado correctamente");
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    }
  };

  const handleCreateElection = async ({ name, description, options, startMinutes, durationMinutes, votingType, maxChoices }) => {
    try {
      const latest = await factory.runner.provider.getBlock("latest");
      const startTime = Number(latest.timestamp) + startMinutes * 60;
      const endTime = startTime + durationMinutes * 60;
      const tx = await factory.createElection(name, description, options, startTime, endTime, votingType, maxChoices);
      await tx.wait();
      await refreshData(registry, factory);
      logActivity("election_created", { name });
      toast.success("✅ Elección creada exitosamente");
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    }
  };

  const handleVote = async (electionAddress, candidateId) => {
    setLoadingVote(true);
    try {
      const election = await getContract(electionAddress, electionAbi);
      const tx = await election.voteSingle(candidateId);
      await tx.wait();
      await refreshData(registry, factory);
      const e = elections.find((el) => el.address === electionAddress);
      logActivity("vote_cast", { name: e?.name || electionAddress });
      toast.success("✅ Voto registrado exitosamente");
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    } finally {
      setLoadingVote(false);
    }
  };

  const handleVoteMultiple = async (electionAddress, candidateIds) => {
    setLoadingVote(true);
    try {
      const election = await getContract(electionAddress, electionAbi);
      const tx = await election.voteMultiple(candidateIds);
      await tx.wait();
      await refreshData(registry, factory);
      const e = elections.find((el) => el.address === electionAddress);
      logActivity("vote_multiple", { name: e?.name || electionAddress });
      toast.success("✅ Votos registrados exitosamente");
    } catch (err) {
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    } finally {
      setLoadingVote(false);
    }
  };

  const effectiveTab = !isAdmin && activeTab === "admin" ? "vote" : activeTab;

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={4000} />

      {selectedElection && (
        <ElectionDetailModal
          election={selectedElection}
          onClose={() => setSelectedElection(null)}
        />
      )}

      <header className="app-header">
        <div>
          <h1 className="app-title">🗳️ Sistema de Votación</h1>
          <p className="app-subtitle">Red: {NETWORK} · Votantes: {totalVoters}</p>
        </div>
        <ConnectWallet account={account} onConnect={connectWallet} />
      </header>

      {account && (
        <nav className="nav-tabs">
          {isAdmin && (
            <button
              className={`nav-tab${effectiveTab === "admin" ? " active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              Panel Admin
            </button>
          )}
          <button
            className={`nav-tab${effectiveTab === "vote" ? " active" : ""}`}
            onClick={() => setActiveTab("vote")}
          >
            Votar
          </button>
          <button
            className={`nav-tab${effectiveTab === "results" ? " active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Resultados
          </button>
        </nav>
      )}

      <main className="layout">
        {!account ? (
          <LandingPage onConnect={connectWallet} />
        ) : effectiveTab === "admin" ? (
          isAdmin ? (
            <AdminDashboard
              elections={elections}
              totalVoters={totalVoters}
              onRegister={handleRegister}
              onCreate={handleCreateElection}
              onSelectElection={setSelectedElection}
              activityLog={activityLog}
            />
          ) : (
            <div className="card access-denied">
              <strong>🔒 Acceso restringido</strong>
              <p>No tienes permisos de administrador. Conecta la wallet del propietario del contrato.</p>
            </div>
          )
        ) : effectiveTab === "vote" ? (
          <div className="card">
            <CastVote
              elections={elections}
              onVote={handleVote}
              onVoteMultiple={handleVoteMultiple}
              loadingVote={loadingVote}
            />
          </div>
        ) : (
          <div className="card">
            <ElectionViewer elections={elections} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

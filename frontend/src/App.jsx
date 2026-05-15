import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConnectWallet from "./components/ConnectWallet";
import AdminLayout from "./components/admin/AdminLayout";
import CastVote from "./components/CastVote";
import ElectionViewer from "./components/ElectionViewer";
import LandingPage from "./components/LandingPage";
import Home from "./components/Home";
import ElectionDetailModal from "./components/ElectionDetailModal";
import VoteReceipt from "./components/VoteReceipt";
import ChatBot from "./components/ChatBot";
import ChatBotButton from "./components/ChatBotButton";
import ErrorBoundary from "./components/ErrorBoundary";
import { saveReceipt } from "./utils/receiptStorage";
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
  if (msg.includes("Admin cannot vote")) return "Los administradores no pueden votar en elecciones que ellos mismos crearon.";
  if (msg.includes("user rejected")) return "Cancelaste la confirmación de seguridad.";
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
  const [activeTab, setActiveTab] = useState("home");
  const [selectedElection, setSelectedElection] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState(null);

  const logActivity = (type, payload = {}) => {
    setActivityLog((prev) => [...prev.slice(-49), { type, payload, timestamp: new Date() }]);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => silentReconnect());
      window.ethereum.on("chainChanged", () => silentReconnect());
    }
    silentReconnect();
  }, []);

  // Auto-reconnect SIN popup: solo lee cuentas ya autorizadas previamente
  const silentReconnect = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts && accounts.length > 0) {
        await ensureNetwork(NETWORK);
        setAccount(accounts[0]);
        await loadContracts();
      }
    } catch (err) {
      console.error("Error en reconexión silenciosa:", err);
    }
  };

  // Conexión explícita: muestra popup MetaMask (solo cuando el usuario lo pide)
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("⚠️ No se detectó una billetera digital. Instala MetaMask u otra compatible para continuar.");
      return;
    }
    try {
      await ensureNetwork(NETWORK);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      setAccount(addr);
      await loadContracts();
    } catch (err) {
      if (err.code === 4001) {
        toast.info("Conexión cancelada");
      } else {
        console.error(err);
        toast.error("⚠️ No se pudo iniciar la sesión");
      }
    }
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
    const currentAddr = (await reg.runner.getAddress()).toLowerCase();
    setIsAdmin(owner.toLowerCase() === currentAddr);

    await refreshData(reg, fac, currentAddr);
  };

  // Auto-refresh de elecciones cada 15 segundos (mantiene estado actualizado en demo)
  useEffect(() => {
    if (!registry || !factory) return;
    const interval = setInterval(() => {
      refreshData(registry, factory, account);
    }, 15000);
    return () => clearInterval(interval);
  }, [registry, factory, account]);

  const refreshData = async (reg, fac, currentAccount) => {
    if (!reg || !fac) return;
    try {
      const total = await reg.getTotalRegistered();
      setTotalVoters(Number(total));

      const addresses = await fac.getElections();
      const items = [];
      for (let idx = 0; idx < addresses.length; idx++) {
        const addr = addresses[idx];
        try {
          const election = await getContract(addr, electionAbi);
          const [name, description, startTime, endTime, active, votingType, maxChoices, electionAdmin] = await Promise.all([
            election.name(),
            election.description(),
            election.startTime(),
            election.endTime(),
            election.isActive(),
            election.votingType(),
            election.maxChoices(),
            election.admin(),
          ]);
          const candidates = await election.getCandidates();
          const totalVotes = await election.totalVotes();
          const acc = currentAccount || account;
          const hasVoted = acc ? await election.hasVoted(acc) : false;
          items.push({
            id: idx + 1,
            address: addr,
            name: name || "Elección sin nombre",
            description: description || "",
            startTime: Number(startTime),
            endTime: Number(endTime),
            totalVotes: Number(totalVotes),
            options: (candidates || []).map((c) => c.name),
            votes: (candidates || []).map((c) => Number(c.votes)),
            isActive: active,
            votingType: Number(votingType),
            maxChoices: Number(maxChoices),
            admin: (electionAdmin || "").toLowerCase(),
            hasVoted,
          });
        } catch (electionErr) {
          console.error(`Error cargando elección ${addr}:`, electionErr);
        }
      }
      setElections(items);
    } catch (err) {
      console.error("Error en refreshData:", err);
      toast.error("⚠️ Error al refrescar datos. Intenta de nuevo.");
    }
  };

  const shortHash = (hash) => `${hash.slice(0, 8)}…${hash.slice(-6)}`;

  const handleRegister = async (addr) => {
    let pendingToast;
    try {
      const tx = await registry.registerVoter(addr);
      pendingToast = toast.info(`⏳ Registrando votante... (tx: ${shortHash(tx.hash)})`, { autoClose: false });
      await tx.wait();
      toast.dismiss(pendingToast);
      await refreshData(registry, factory, account);
      logActivity("voter_registered", { name: addr });
      toast.success(`✅ Votante registrado · ${shortHash(tx.hash)}`);
    } catch (err) {
      if (pendingToast) toast.dismiss(pendingToast);
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    }
  };

  const handleCreateElection = async ({ name, description, options, startMinutes, durationMinutes, votingType, maxChoices }) => {
    let pendingToast;
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const startTime = nowSec + startMinutes * 60;
      const endTime = startTime + durationMinutes * 60;
      const tx = await factory.createElection(name, description, options, startTime, endTime, votingType, maxChoices);
      pendingToast = toast.info(`⏳ Creando elección... (tx: ${shortHash(tx.hash)})`, { autoClose: false });
      await tx.wait();
      toast.dismiss(pendingToast);
      await refreshData(registry, factory, account);
      logActivity("election_created", { name });
      toast.success(`✅ Elección "${name}" creada · ${shortHash(tx.hash)}`);
    } catch (err) {
      if (pendingToast) toast.dismiss(pendingToast);
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    }
  };

  const buildReceipt = async (tx, receiptObj, electionAddress) => {
    const e = elections.find((el) => el.address === electionAddress);
    return {
      txHash: tx.hash,
      blockNumber: receiptObj?.blockNumber,
      electionAddress,
      electionName: e?.name || "Elección",
      savedAt: new Date().toISOString(),
    };
  };

  const handleVote = async (electionAddress, candidateId) => {
    setLoadingVote(true);
    let pendingToast;
    try {
      const election = await getContract(electionAddress, electionAbi);
      const tx = await election.voteSingle(candidateId);
      pendingToast = toast.info(`⏳ Enviando voto... (tx: ${shortHash(tx.hash)})`, { autoClose: false });
      const txReceipt = await tx.wait();
      toast.dismiss(pendingToast);
      await refreshData(registry, factory, account);
      const e = elections.find((el) => el.address === electionAddress);
      logActivity("vote_cast", { name: e?.name || electionAddress });
      toast.success(`✅ Voto registrado · ${shortHash(tx.hash)}`);

      // Generar y mostrar comprobante
      const receipt = await buildReceipt(tx, txReceipt, electionAddress);
      saveReceipt(account, receipt);
      setVoteReceipt(receipt);
    } catch (err) {
      if (pendingToast) toast.dismiss(pendingToast);
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    } finally {
      setLoadingVote(false);
    }
  };

  const handleVoteMultiple = async (electionAddress, candidateIds) => {
    setLoadingVote(true);
    let pendingToast;
    try {
      const election = await getContract(electionAddress, electionAbi);
      const tx = await election.voteMultiple(candidateIds);
      pendingToast = toast.info(`⏳ Enviando ${candidateIds.length} votos... (tx: ${shortHash(tx.hash)})`, { autoClose: false });
      const txReceipt = await tx.wait();
      toast.dismiss(pendingToast);
      await refreshData(registry, factory, account);
      const e = elections.find((el) => el.address === electionAddress);
      logActivity("vote_multiple", { name: e?.name || electionAddress });
      toast.success(`✅ ${candidateIds.length} votos registrados · ${shortHash(tx.hash)}`);

      // Generar y mostrar comprobante
      const receipt = await buildReceipt(tx, txReceipt, electionAddress);
      saveReceipt(account, receipt);
      setVoteReceipt(receipt);
    } catch (err) {
      if (pendingToast) toast.dismiss(pendingToast);
      console.error(err);
      toast.error(`⚠️ ${getHumanError(err)}`);
    } finally {
      setLoadingVote(false);
    }
  };

  const effectiveTab = !isAdmin && activeTab === "admin" ? "home" : activeTab;

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={4000} />

      {selectedElection && (
        <ElectionDetailModal
          election={selectedElection}
          onClose={() => setSelectedElection(null)}
        />
      )}

      {voteReceipt && (
        <VoteReceipt receipt={voteReceipt} onClose={() => setVoteReceipt(null)} />
      )}

      <header className="app-header">
        <div>
          <h1 className="app-title">🗳️ Plataforma de Votación</h1>
          <p className="app-subtitle">Red: {NETWORK} · Votantes: {totalVoters}</p>
        </div>
        <ConnectWallet account={account} onConnect={connectWallet} />
      </header>

      {account && (
        <nav className="nav-tabs">
          <button
            className={`nav-tab${effectiveTab === "home" ? " active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Inicio
          </button>
          {isAdmin && (
            <button
              className={`nav-tab${effectiveTab === "admin" ? " active theme-admin-active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              Panel Admin
            </button>
          )}
          <button
            className={`nav-tab${effectiveTab === "vote" ? " active theme-vote-active" : ""}`}
            onClick={() => setActiveTab("vote")}
          >
            Votar
          </button>
          <button
            className={`nav-tab${effectiveTab === "results" ? " active theme-results-active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Resultados
          </button>
        </nav>
      )}

      <main className={`layout theme-${effectiveTab}`}>
        <ErrorBoundary>
          {!account ? (
            <LandingPage onConnect={connectWallet} />
          ) : effectiveTab === "home" ? (
            <div className="card card-themed">
              <Home
                account={account}
                isAdmin={isAdmin}
                elections={elections}
                totalVoters={totalVoters}
                onNavigate={setActiveTab}
              />
            </div>
          ) : effectiveTab === "admin" ? (
            isAdmin ? (
              <AdminLayout
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
                <p>No tienes permisos de administrador. Inicia sesión con la cuenta autorizada para administrar.</p>
              </div>
            )
          ) : effectiveTab === "vote" ? (
            <div className="card card-themed">
              <span className="section-context-badge vote">🗳️ Sección de votación</span>
              <CastVote
                elections={elections}
                account={account}
                onVote={handleVote}
                onVoteMultiple={handleVoteMultiple}
                loadingVote={loadingVote}
              />
            </div>
          ) : (
            <div className="card card-themed">
              <span className="section-context-badge results">📊 Sección de resultados</span>
              <ElectionViewer elections={elections} />
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Chatbot — siempre visible para usuarios conectados o en landing */}
      <ChatBot
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentSection={effectiveTab}
      />
      <ChatBotButton
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </div>
  );
}

export default App;

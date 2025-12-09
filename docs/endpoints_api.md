\# API y Contratos



\## Métodos del Contrato Registry



```solidity

// Registro

registerVoter(address voter) → Registra un nuevo votante

removeVoter(address voter) → Elimina un votante



// Consultas

isRegistered(address voter) → bool

getTotalRegistered() → uint256

getRegisteredVoters() → address\[]



Métodos del Contrato Voting

solidity



// Gestión

createElection(name, description, options, startTime, duration) → uint256



// Votación

vote(electionId, option) → void



// Consultas

getElectionResults(electionId) → (name, options\[], votes\[], total, active)

hasVoted(electionId, voter) → bool

getElectionInfo(electionId) → (name, description, start, end, exists, total)



Eventos



&nbsp;   VoterRegistered: Cuando se registra un votante



&nbsp;   VoteCast: Cuando se emite un voto



&nbsp;   ElectionCreated: Nueva elección creada



&nbsp;   ElectionEnded: Elección finalizada


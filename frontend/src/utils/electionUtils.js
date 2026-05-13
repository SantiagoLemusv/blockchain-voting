export function getElectionState(election) {
  const now = Math.floor(Date.now() / 1000);
  if (now < election.startTime) return "upcoming";
  if (now < election.endTime) return "active";
  return "ended";
}

export function timeRemaining(targetTime) {
  const now = Date.now() / 1000;
  const diff = Math.floor(targetTime - now);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function getWinner(election) {
  if (!election.votes || election.votes.length === 0) return null;
  const maxVotes = Math.max(...election.votes);
  if (maxVotes === 0) return null;
  const winnerIdx = election.votes.indexOf(maxVotes);
  return { name: election.options[winnerIdx], votes: maxVotes, idx: winnerIdx };
}

export function candidatePercent(votes, totalVotes) {
  if (!totalVotes || totalVotes === 0) return 0;
  return ((votes / totalVotes) * 100).toFixed(1);
}

export function participationRate(totalVotes, totalVoters) {
  if (!totalVoters || totalVoters === 0) return 0;
  return Math.min(100, Math.round((totalVotes / totalVoters) * 100));
}

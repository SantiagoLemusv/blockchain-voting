export const electionAbi = [
  "function registry() view returns (address)",
  "function admin() view returns (address)",
  "function name() view returns (string)",
  "function description() view returns (string)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function isActive() view returns (bool)",
  "function candidateCount() view returns (uint256)",
  "function getCandidate(uint256) view returns (string,uint256)",
  "function getCandidates() view returns (tuple(string name,uint256 votes)[])",
  "function totalVotes() view returns (uint256)",
  "function hasVoted(address) view returns (bool)",
  "function vote(uint256 candidateId)",
  "event VoteCast(address indexed voter,uint256 indexed candidateId)",
  "event ElectionClosed(address indexed executor,uint256 totalVotes)"
];

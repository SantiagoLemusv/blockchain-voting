export const votingAbi = [
  "function registry() view returns (address)",
  "function nextElectionId() view returns (uint256)",
  "function createElection(string name,string description,string[] options,uint256 startTime,uint256 duration) returns (uint256)",
  "function vote(uint256 electionId,uint256 option)",
  "function getElectionResults(uint256 electionId) view returns (string name,string[] options,uint256[] votes,uint256 totalVotes,bool isActive)",
  "function hasVoted(uint256 electionId,address voter) view returns (bool)",
  "function getElectionInfo(uint256 electionId) view returns (string name,string description,uint256 startTime,uint256 endTime,bool exists,uint256 totalVotes)",
  "event ElectionCreated(uint256 indexed electionId,string name)",
  "event VoteCast(uint256 indexed electionId,address indexed voter,uint256 option)",
  "event ElectionEnded(uint256 indexed electionId)"
];

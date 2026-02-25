export const factoryAbi = [
  "function owner() view returns (address)",
  "function registry() view returns (address)",
  "function getElections() view returns (address[])",
  "function electionsCount() view returns (uint256)",
  "function createElection(string name,string description,string[] candidates,uint256 startTime,uint256 endTime) returns (address)",
  "event ElectionCreated(address indexed electionAddress,string name,uint256 startTime,uint256 endTime)"
];

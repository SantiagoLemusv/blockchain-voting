export const registryAbi = [
  "function owner() view returns (address)",
  "function isRegistered(address) view returns (bool)",
  "function registerVoter(address voter)",
  "function removeVoter(address voter)",
  "function getTotalRegistered() view returns (uint256)",
  "function getRegisteredVoters() view returns (address[])",
  "event VoterRegistered(address indexed voter)",
  "event VoterRemoved(address indexed voter)"
];

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Registry {
    mapping(address => bool) public isRegistered;
    address[] private registeredVoters;
    address public owner;
    
    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function registerVoter(address voter) external onlyOwner {
        require(!isRegistered[voter], "Already registered");
        isRegistered[voter] = true;
        registeredVoters.push(voter);
        emit VoterRegistered(voter);
    }
    
    function removeVoter(address voter) external onlyOwner {
        require(isRegistered[voter], "Not registered");
        isRegistered[voter] = false;
        emit VoterRemoved(voter);
    }
    
    function getTotalRegistered() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < registeredVoters.length; i++) {
            if (isRegistered[registeredVoters[i]]) {
                count++;
            }
        }
        return count;
    }
    
    function getRegisteredVoters() external view returns (address[] memory) {
        return registeredVoters;
    }
}
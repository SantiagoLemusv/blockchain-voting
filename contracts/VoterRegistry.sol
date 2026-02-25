// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title Voter Registry
/// @notice Gestiona altas/bajas de votantes autorizados para cualquier elección.
contract VoterRegistry {
    mapping(address => bool) public isRegistered;
    address[] private registeredVoters;
    address public owner;

    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerVoter(address voter) external onlyOwner {
        require(voter != address(0), "Zero address");
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
        uint256 count;
        for (uint256 i = 0; i < registeredVoters.length; i++) {
            if (isRegistered[registeredVoters[i]]) count++;
        }
        return count;
    }

    function getRegisteredVoters() external view returns (address[] memory) {
        return registeredVoters;
    }
}

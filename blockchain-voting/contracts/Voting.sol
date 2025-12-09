// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./interfaces/IRegistry.sol";

contract Voting {
    IRegistry public registry;
    
    struct Election {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool exists;
        uint256 totalVotes;
        string[] options;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votesPerOption;
    }
    
    mapping(uint256 => Election) public elections;
    uint256 public nextElectionId = 1;
    
    event ElectionCreated(uint256 indexed electionId, string name);
    event VoteCast(uint256 indexed electionId, address indexed voter, uint256 option);
    event ElectionEnded(uint256 indexed electionId);
    
    constructor(address registryAddress) {
        registry = IRegistry(registryAddress);
    }
    
    function createElection(
        string memory name,
        string memory description,
        string[] memory options,
        uint256 startTime,
        uint256 duration
    ) external returns (uint256) {
        require(options.length >= 2, "Minimum 2 options");
        require(startTime > block.timestamp, "Start time must be future");
        
        uint256 electionId = nextElectionId++;
        Election storage e = elections[electionId];
        
        e.name = name;
        e.description = description;
        e.startTime = startTime;
        e.endTime = startTime + duration;
        e.exists = true;
        
        for (uint256 i = 0; i < options.length; i++) {
            e.options.push(options[i]);
        }
        
        emit ElectionCreated(electionId, name);
        return electionId;
    }
    
    function vote(uint256 electionId, uint256 option) external {
        Election storage e = elections[electionId];
        
        require(e.exists, "Election doesn't exist");
        require(block.timestamp >= e.startTime, "Election hasn't started");
        require(block.timestamp <= e.endTime, "Election has ended");
        require(registry.isRegistered(msg.sender), "Voter not registered");
        require(!e.hasVoted[msg.sender], "Already voted");
        require(option < e.options.length, "Invalid option");
        
        e.hasVoted[msg.sender] = true;
        e.votesPerOption[option]++;
        e.totalVotes++;
        
        emit VoteCast(electionId, msg.sender, option);
        
        if (block.timestamp > e.endTime) {
            emit ElectionEnded(electionId);
        }
    }
    
    function getElectionResults(uint256 electionId) external view returns (
        string memory name,
        string[] memory options,
        uint256[] memory votes,
        uint256 totalVotes,
        bool isActive
    ) {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");
        
        options = new string[](e.options.length);
        votes = new uint256[](e.options.length);
        
        for (uint256 i = 0; i < e.options.length; i++) {
            options[i] = e.options[i];
            votes[i] = e.votesPerOption[i];
        }
        
        isActive = block.timestamp >= e.startTime && block.timestamp <= e.endTime;
        
        return (e.name, options, votes, e.totalVotes, isActive);
    }
    
    function hasVoted(uint256 electionId, address voter) external view returns (bool) {
        return elections[electionId].hasVoted[voter];
    }
    
    function getElectionInfo(uint256 electionId) external view returns (
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool exists,
        uint256 totalVotes
    ) {
        Election storage e = elections[electionId];
        return (e.name, e.description, e.startTime, e.endTime, e.exists, e.totalVotes);
    }
}
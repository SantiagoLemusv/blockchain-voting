// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./interfaces/IRegistry.sol";

/// @title Election
/// @notice Instancia autónoma de una elección con lista de candidatos y ventana de tiempo.
contract Election {
    struct Candidate {
        string name;
        uint256 votes;
    }

    IRegistry public registry;
    address public admin;

    string public name;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    bool public closed;

    Candidate[] private candidates;
    mapping(address => bool) public hasVoted;

    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionClosed(address indexed executor, uint256 totalVotes);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyDuringElection() {
        require(block.timestamp >= startTime, "Election not started");
        require(block.timestamp <= endTime, "Election ended");
        _;
    }

    constructor(
        address _registry,
        address _admin,
        string memory _name,
        string memory _description,
        string[] memory _candidates,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(_registry != address(0), "Registry required");
        require(_admin != address(0), "Admin required");
        require(_candidates.length >= 2, "At least 2 candidates");
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime >= block.timestamp, "Start must be future");

        registry = IRegistry(_registry);
        admin = _admin;
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;

        for (uint256 i = 0; i < _candidates.length; i++) {
            candidates.push(Candidate({name: _candidates[i], votes: 0}));
        }
    }

    function vote(uint256 candidateId) external onlyDuringElection {
        require(!hasVoted[msg.sender], "Already voted");
        require(registry.isRegistered(msg.sender), "Not authorized");
        require(candidateId < candidates.length, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[candidateId].votes += 1;

        emit VoteCast(msg.sender, candidateId);
    }

    function closeElection() external onlyAdmin {
        require(!closed, "Already closed");
        require(block.timestamp > endTime, "Election still active");
        closed = true;
        emit ElectionClosed(msg.sender, totalVotes());
    }

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 candidateId) external view returns (string memory, uint256) {
        require(candidateId < candidates.length, "Invalid candidate");
        Candidate memory c = candidates[candidateId];
        return (c.name, c.votes);
    }

    function getCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory arr = new Candidate[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            arr[i] = candidates[i];
        }
        return arr;
    }

    function totalVotes() public view returns (uint256 sum) {
        for (uint256 i = 0; i < candidates.length; i++) {
            sum += candidates[i].votes;
        }
    }

    function isActive() public view returns (bool) {
        return block.timestamp >= startTime && block.timestamp <= endTime && !closed;
    }
}

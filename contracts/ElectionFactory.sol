// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Election.sol";
import "./interfaces/IRegistry.sol";

/// @title ElectionFactory
/// @notice Despliega elecciones independientes y mantiene un índice de direcciones.
contract ElectionFactory {
    address public owner;
    IRegistry public registry;
    address[] public elections;

    event ElectionCreated(address indexed electionAddress, string name, uint256 startTime, uint256 endTime);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _registry) {
        require(_registry != address(0), "Registry required");
        owner = msg.sender;
        registry = IRegistry(_registry);
    }

    function createElection(
        string memory _name,
        string memory _description,
        string[] memory _candidates,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner returns (address) {
        Election election = new Election(
            address(registry),
            msg.sender,
            _name,
            _description,
            _candidates,
            _startTime,
            _endTime
        );
        address electionAddr = address(election);
        elections.push(electionAddr);
        emit ElectionCreated(electionAddr, _name, _startTime, _endTime);
        return electionAddr;
    }

    function getElections() external view returns (address[] memory) {
        return elections;
    }

    function electionsCount() external view returns (uint256) {
        return elections.length;
    }
}

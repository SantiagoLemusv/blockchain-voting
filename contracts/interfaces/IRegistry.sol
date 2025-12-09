// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IRegistry {
    function isRegistered(address voter) external view returns (bool);
    function getTotalRegistered() external view returns (uint256);
}
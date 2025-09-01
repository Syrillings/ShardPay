// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//random
contract Vault {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public goals;
    mapping(address => bool) public microSaveEnabled;

    function deposit(uint256 amount) external payable {
        require(msg.value == amount, "Send exact amount");
        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough saved");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function setGoal(uint256 amount) external {
        goals[msg.sender] = amount;
    }

    function getGoal(address user) external view returns (uint256) {
        return goals[user];
    }

    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function toggleMicroSave(bool enabled) external {
        microSaveEnabled[msg.sender] = enabled;
    }

    function getMicroSaveStatus(address user) external view returns (bool) {
        return microSaveEnabled[user];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentRegistry {
    event ConsentGiven(
        address indexed user,
        string partnerId,
        string purpose,
        uint256 timestamp
    );

    function giveConsent(string memory partnerId, string memory purpose) public {
        emit ConsentGiven(msg.sender, partnerId, purpose, block.timestamp);
    }
}

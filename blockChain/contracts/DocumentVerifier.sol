// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentVerifier {
    event DocumentRegistered(
        address indexed submitter,
        bytes32 indexed documentHash,
        uint256 timestamp
    );

    mapping(bytes32 => address) public documents;

    function registerDocument(bytes32 documentHash) public {
        require(documents[documentHash] == address(0), "Document already registered");
        
        documents[documentHash] = msg.sender;
        emit DocumentRegistered(msg.sender, documentHash, block.timestamp);
    }

    function verifyDocument(bytes32 documentHash) public view returns (address submitter) {
        return documents[documentHash];
    }
}

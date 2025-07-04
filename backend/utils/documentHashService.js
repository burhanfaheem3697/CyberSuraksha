const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ethers } = require("ethers");

require("dotenv").config({ path: __dirname + "/../../blockChain/.env" });

const CONTRACT_ABI = require("../../blockChain/artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json").abi;
const CONTRACT_ADDRESS = "0xC00072d8c265e7568233E341D204f0E10908ECa7"; // Replace this

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Hash the document using SHA-256
function getDocumentHash(fileBuffer) {
  return "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// Register document hash on-chain
async function registerDocumentOnChain(fileBuffer) {
  const docHash = getDocumentHash(fileBuffer);
  const tx = await contract.registerDocument(docHash);
  const receipt = await tx.wait();
  return {
    hash: docHash,
    txHash: receipt.hash,
  };
}

module.exports = { registerDocumentOnChain };

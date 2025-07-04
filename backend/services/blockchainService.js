const { ethers } = require('ethers');
const { hashFinancialData } = require('../utils/hashUtils');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../blockChain/.env') });

const CONTRACT_ABI = require('../../blockChain/artifacts/contracts/DocumentVerifier.sol/DocumentVerifier.json').abi;
const CONTRACT_ADDRESS = process.env.DOCUMENT_VERIFIER_CONTRACT;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!CONTRACT_ADDRESS || !RPC_URL || !PRIVATE_KEY) {
  throw new Error('Missing blockchain environment variables.');
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

async function registerDataHash(data) {
  const hash = hashFinancialData(data);
  const tx = await contract.registerDocument(hash);
  const receipt = await tx.wait();
  return { hash, txHash: receipt.transactionHash };
}

async function verifyDataHash(data) {
  const hash = hashFinancialData(data);
  return await contract.documentExists(hash);
}

module.exports = {
  registerDataHash,
  verifyDataHash
}; 
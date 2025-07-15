const { ethers } = require("ethers");
require("dotenv").config({ path: __dirname + "/../../blockChain/.env" });

const CONTRACT_ABI = require("../../blockChain/artifacts/contracts/ConsentRegistry.sol/ConsentRegistry.json").abi;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x63cd37d1AF2F6bb49FBE080066A9446370EE90B5"; // Use env or default

// Setup provider with a try-catch to handle errors
let provider, wallet, contract;

try {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001", provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
} catch (error) {
  console.error("Error initializing blockchain service:", error.message);
}

async function logConsentOnChain(partnerId, purpose) {
  try {
    if (!contract) {
      console.warn("Blockchain contract not initialized. Skipping blockchain logging.");
      return "blockchain-unavailable";
    }
    
    // Validate parameters
    if (!partnerId || !purpose) {
      console.warn("Invalid parameters for blockchain logging. partnerId:", partnerId, "purpose:", purpose);
      return "blockchain-invalid-params";
    }
    
    // Convert partnerId to string if it's an object (MongoDB ObjectId)
    const partnerIdStr = typeof partnerId === 'object' ? partnerId.toString() : partnerId;
    
    console.log(`Calling blockchain with partnerId: ${partnerIdStr}, purpose: ${purpose}`);
    const tx = await contract.giveConsent(partnerIdStr, purpose);

    if (typeof partnerIdStr !== "string" || typeof purpose !== "string") {
      throw new Error("partnerId and purpose must be strings");
    }
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error("Error logging consent on blockchain:", error.message);
    return "blockchain-error";
  }
}

module.exports = { logConsentOnChain };

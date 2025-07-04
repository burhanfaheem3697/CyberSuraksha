# CyberSuraksha Blockchain Module

This directory contains the smart contracts and deployment scripts for the CyberSuraksha platform. The contracts are deployed and tested using [Hardhat](https://hardhat.org/).

## Network
- **Testnet:** Amoy Testnet (Polygon)

## Consent Storage Policy
- **On-Chain Storage:** Consents are only recorded on the blockchain when a user explicitly approves a consent request.
- **No Partner Auto-Storage:** When a partner creates a consent request, it is *not* stored on-chain. Only user approval triggers blockchain storage.

## Verifying Consents On-Chain
- After a user approves a consent, the consent's transaction hash (`txHash`) and document hash (`documentHash`) are available in the dashboard.
- You can verify the consent on the Amoy Testnet blockchain explorer using the provided transaction hash.
- The frontend provides a "Blockchain Verification" tool to check the status and details of any consent on-chain.

## Usage

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## Contracts
- `ConsentRegistry.sol` — Main registry for consent hashes
- `DocumentVerifier.sol` — Verifies document hashes on-chain
- `Lock.sol` — Sample contract

## Notes
- Make sure to update `.env` files with the correct RPC URLs and private keys for deployment.
- The consent approval flow is now user-driven for blockchain storage.

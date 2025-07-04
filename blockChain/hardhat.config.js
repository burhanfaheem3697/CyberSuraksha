require("./tasks/accounts");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });


module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

const fs = require('fs');

const accounts = {
  mnemonic: fs.readFileSync(".secret").toString().trim(),
  // path: "m/44'/60'/0'/0",
  // initialIndex: 0,
  // count: 20
}

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      accounts
    },
    mumbai: {
      // url: "https://rpc-mumbai.maticvigil.com",
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts,
      chainId: 80001,
      // from:
      // gas: "auto",
      // gasPrice: "auto",
      // gasMultiplier: 1,
      // timeout: 20000
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts,
      chainId: 137,
      // from:
      // gas: "auto",
      // gasPrice: "auto",
      // gasMultiplier: 1,
      // timeout: 20000
    }
  },
  solidity: {
    version: "0.6.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};

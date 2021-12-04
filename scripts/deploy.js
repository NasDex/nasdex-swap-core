const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const env = require("hardhat");
const { ethers } = require("hardhat");

const FACTORY = "0x21051bb022a8B5aED0F0df7B34c9F067127c39bD";
const WETH = "0x22104669DA1a0a1B3631EdDee6b1B4d41c521F83";

async function main() {
    [deployer] = await ethers.getSigners();
    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );
    
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02");
    const instance = await UniswapV2Router02.deploy(FACTORY, WETH);

    console.log("UniswapV2Router02 address: " + instance.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
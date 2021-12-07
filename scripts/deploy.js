const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const env = require("hardhat");
const { ethers } = require("hardhat");


async function main() {
    [deployer] = await ethers.getSigners();
    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );
    
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const NasdexSwapFactory = await ethers.getContractFactory("NasdexSwapFactory");
    const instance = await NasdexSwapFactory.deploy(deployer.address);

    console.log("NasdexSwapFactory address: " + instance.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
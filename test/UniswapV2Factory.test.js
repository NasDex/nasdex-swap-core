const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UniswapV2Factory contract", function() {

    let factory;

    before(async function() {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await UniswapV2Factory.deploy(owner.address);
    });

    beforeEach(async function() {

    });

    afterEach(async function() {
        
    });

    after(async function() {

    });

    describe("FeeToSetter transfer", function() {
        it("Should set the right FeeToSetter", async function () {
            expect(await factory.feeToSetter()).to.equal(owner.address);
        });
      
        it("Should can be transfer to another", async function () {
            await factory.setFeeToSetter(addr1.address);
            expect(await factory.feeToSetter()).to.equal(addr1.address);
            await factory.connect(addr1).setFeeToSetter(owner.address);
            expect(await factory.feeToSetter()).to.equal(owner.address);
        });
    });
});
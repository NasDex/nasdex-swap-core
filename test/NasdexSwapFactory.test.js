const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {loadFixture, deployContract} = waffle;

const ONE = ethers.BigNumber.from(1);
const TWO = ethers.BigNumber.from(2);

function sqrt(value) {
    x = ethers.BigNumber.from(value);
    let z = x.add(ONE).div(TWO);
    let y = x;
    while (z.sub(y).isNegative()) {
        y = z;
        z = x.div(z).add(z).div(TWO);
    }
    return y;
}

describe("NasdexSwapFactory contract", function() {

    let factory;
    let router;

    let Token;

    let _token0;
    let _token1;

    let tokenA;
    let tokenB;

    let pair;
    let lpAmount;

    let reserveA;
    let reserveB;

    let tokenDecimals;

    before(async function() {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const NasdexSwapFactory = await ethers.getContractFactory("NasdexSwapFactory");
        const WETH9 = require("./artifacts/WETH9");
        const NasdexSwapRouter = require("./artifacts/NasdexSwapRouter");
        Token = require("./artifacts/AssetToken");

        factory = await NasdexSwapFactory.deploy(owner.address);
        console.log();
        console.log("code hash: " + await factory.INIT_CODE_PAIR_HASH());
        console.log("---------------------> replace code hash in test/artifacts/NasdexSwapRouter.json <-----------------------");
        console.log();

        const weth = await deployContract(owner, WETH9);
        router = await deployContract(owner, NasdexSwapRouter, [factory.address, weth.address]);

        _token0 = await deployContract(owner, Token, ["Token M", "TM"]);
        _token1 = await deployContract(owner, Token, ["Token N", "TN"]);

        tokenDecimals = BigNumber.from(10).pow(await _token0.decimals());
        await _token0.mint(owner.address, BigNumber.from("1000000000").mul(tokenDecimals)); // 1 billion.
        await _token1.mint(owner.address, BigNumber.from("1000000000").mul(tokenDecimals)); // 1 billion.
        await _token0.approve(router.address, BigNumber.from("1000000000000").mul(tokenDecimals)); // 1 trillion.
        await _token1.approve(router.address, BigNumber.from("1000000000000").mul(tokenDecimals)); // 1 trillion.
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

    describe("Set feeTo address", function() {
        it("Could set feeTo address", async function() {
            await factory.setFeeTo(addr1.address);
            expect(await factory.feeTo()).to.equal(addr1.address);
        });
    })

    describe("Add liquidity", function() {
        
        let amountA;
        let amountB;
        it("Could add liquidity", async function() {
            amountA = BigNumber.from('100000').mul(tokenDecimals);
            amountB = BigNumber.from('100000').mul(tokenDecimals);
            
            await router.addLiquidity(
                _token0.address, 
                _token1.address, 
                amountA, 
                amountB, 
                0, 
                0, 
                owner.address, 
                BigNumber.from('1000000000000000000')
            );
            let pairaddr = await factory.getPair(_token0.address, _token1.address);
            pair = await ethers.getContractAt("INasdexSwapPair", pairaddr);
            tokenA = await ethers.getContractAt(Token.abi, await pair.token0());
            tokenB = await ethers.getContractAt(Token.abi, await pair.token1());
            
            let reserve = await pair.getReserves();
            reserveA = reserve.reserve0;
            reserveB = reserve.reserve1;
            // console.log("reserveA: " + reserve.reserve0.div(tokenDecimals).toString());
            // console.log("reserveB: " + reserve.reserve1.div(tokenDecimals).toString());

            expect(await tokenA.balanceOf(pairaddr)).to.equal(reserveA);
            expect(await tokenB.balanceOf(pairaddr)).to.equal(reserveB);
        });

        it("Right lp amount", async function() {
            lpAmount = sqrt(amountA.mul(amountB));
            lpAmount = BigNumber.from(lpAmount.toString());
            expect(await pair.totalSupply()).to.equal(lpAmount);
        });
    });

    describe("Swap token", function() {
        it("Could swap token", async function() {
            const K = reserveA.mul(reserveB);
            const amountIn = BigNumber.from(1000).mul(tokenDecimals);
            // let amountOut = reserveB.sub(K.div(reserveA.add(tokenDecimals.mul(997))));

            let totalFee = await factory.totalFee();
            let amountInWithFee = amountIn.mul(BigNumber.from(1000).sub(totalFee));
            let numerator = amountInWithFee.mul(reserveB);
            let denominator = reserveA.mul(1000).add(amountInWithFee);
            let amountOut = numerator.div(denominator);
            const aa = expect(() => router.swapExactTokensForTokens(
                amountIn,
                0,
                [tokenA.address, tokenB.address],
                owner.address,
                BigNumber.from("10000000000000000000000")
            )).to;
            // await aa.changeTokenBalances(
            //     tokenA,
            //     [owner, pair],
            //     [amountIn.mul(-1), amountIn]
            // );
            await aa.changeTokenBalances(
                tokenB,
                [owner, pair],
                [amountOut, amountOut.mul(-1)]
            );
        });
    });

    describe("Set fee", function() {
        it("Could set fee", async function() {
            (await factory.setTotalFee(5)).wait();
            expect(await factory.totalFee())
            .to
            .equal(5);
        });

        it("Could swap token", async function() {
            let reserve = await pair.getReserves();
            reserveA = reserve.reserve0;
            reserveB = reserve.reserve1;
            const K = reserveA.mul(reserveB);
            const amountIn = BigNumber.from(1000).mul(tokenDecimals);
            // let amountOut = reserveB.sub(K.div(reserveA.add(tokenDecimals.mul(995))));

            let totalFee = await factory.totalFee();
            let amountInWithFee = amountIn.mul(BigNumber.from(1000).sub(totalFee));
            let numerator = amountInWithFee.mul(reserveB);
            let denominator = reserveA.mul(1000).add(amountInWithFee);
            let amountOut = numerator.div(denominator);
            const aa = expect(() => router.swapExactTokensForTokens(
                amountIn,
                0,
                [tokenA.address, tokenB.address],
                owner.address,
                BigNumber.from("10000000000000000000000")
            )).to;
            // await aa.changeTokenBalances(
            //     tokenA,
            //     [owner, pair],
            //     [amountIn.mul(-1), amountIn]
            // );
            await aa.changeTokenBalances(
                tokenB,
                [owner, pair],
                [amountOut, amountOut.mul(-1)]
            );
        });
    });

    describe("Set protocol fee", function() {
        it("Could set protocol fee", async function() {
            await factory.setPercentToDev(4); // 1/5 of totalFee.
            expect(await factory.percentToDev()).to.equal(4);
        });
    });

    describe("Remove liquidity", function() {
        it("Could remove liquidity", async function() {
            let reserve = await pair.getReserves();
            reserveA = reserve.reserve0;
            reserveB = reserve.reserve1;
            await pair.approve(router.address, BigNumber.from('1000000000000000000000000000000')); // 1 trillion.
            await expect(() => router.removeLiquidity(
                tokenA.address,
                tokenB.address,
                lpAmount.div(2),
                0,
                0,
                owner.address,
                BigNumber.from('10000000000000000000')
            ))
            .to
            .changeTokenBalances(
                pair,
                [owner, pair],
                [lpAmount.div(-2), 0]
            );
        });
    });

    describe("Protocol fee", function() {
        it("Should be given fees after remove liquidity", async function() {
            let protocolFee = lpAmount.mul(10000).div(1);
            expect(await pair.balanceOf(addr1.address)).to.above(BigNumber.from("0"));
        });
    });
});
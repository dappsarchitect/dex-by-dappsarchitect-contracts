const { ethers } = require("hardhat") // imports Ethers.js
const { deployTokenFixture } = require("./helpers/TokenFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {

    describe("Deployment", () => {
        const NAME = "Dapps Architect";
        const SYMBOL = "DACT";
        const DECIMALS = 18;
        const TOTAL_SUPPLY = unitFixer(1000000);

        it("has correct name", async () => {
            const { token } = await loadFixture(deployTokenFixture);
            expect(await token.name()).to.equal(NAME); // fetches name from the blockchain and tests it
        });

        it("has correct symbol", async () => {
            const { token } = await loadFixture(deployTokenFixture);
            expect(await token.symbol()).to.equal(SYMBOL); // fetches symbol from the blockchain and tests it
        });

        it("has correct decimals", async () => {
            const { token } = await loadFixture(deployTokenFixture);
            expect(await token.decimals()).to.equal(DECIMALS); // fetches decimals from the blockchain and tests it
        });

        it("has correct total supply", async () => {
            const { token } = await loadFixture(deployTokenFixture);
            expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY); // fetches total supply from the blockchain and tests it to be 1000000000000000000000000
        });

        it("assigns token total supply to the contract deployer", async () => {
            const { token, deployer } = await loadFixture(deployTokenFixture);
            expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY);
        });
    })

    describe("Transferring Tokens", () => {

        describe("Success", () => {
            it("transfers token balances", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture);

                const transaction = await token.connect(deployer).transfer(recipient.address, unitFixer(500000))
                await transaction.wait()

                expect(await token.balanceOf(deployer.address)).to.equal(unitFixer(500000));
                expect(await token.balanceOf(recipient.address)).to.equal(unitFixer(500000))
            })

            it("emits Transfer event", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture);

                const transaction = await token.connect(deployer).transfer(recipient.address, unitFixer(500000))
                await transaction.wait()

                await expect(transaction).to.emit(token, "Transfer")
                    .withArgs(deployer.address, recipient.address, unitFixer(500000))
            })
        })

        describe("Failure", () => {
            it("rejects insufficient balance", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture);
                const INVALID_AMOUNT = unitFixer(2000000)
                const ERROR = "Token: Insufficient Funds"

                await expect(token.connect(deployer).transfer(recipient.address, INVALID_AMOUNT)).to.be.revertedWith(ERROR)
            })

            it("rejects invalid recipient", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture);
                const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Recipient Is Address 0"

                await expect(token.connect(deployer).transfer(INVALID_ADDRESS, unitFixer(500000))).to.be.revertedWith(ERROR)
            })
        })
    })
})

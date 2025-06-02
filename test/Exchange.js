const { ethers } = require("hardhat") // imports Ethers.js
const { deployExchangeFixture, depositExchangeFixture } = require("./helpers/ExchangeFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Exchange", () => {

    describe("Deployment", () => {

        it("has the correct fee account", async () => {
            const { exchange, accounts } = await loadFixture(deployExchangeFixture)
            expect(await exchange.feeAccount()).to.equal(accounts.feeAccount.address)
        })

        it("has the correct fee percentage", async () => {
            const { exchange } = await loadFixture(deployExchangeFixture)
            expect(await exchange.feePercent()).to.equal(10)
        })
    })

    describe("Depositing Tokens", () => {
        const AMOUNT = unitFixer(100)

        describe("Success", () => {
            it("tracks the token deposit", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(depositExchangeFixture)
                expect(await token0.balanceOf(await exchange.getAddress())).to.equal(AMOUNT)
                expect(await exchange.totalBalanceOf(await token0.getAddress(), accounts.user1.address)).to.equal(AMOUNT)
            })

            it("emits a TokensDeposited event", async () => {
                const { tokens: { token0 }, exchange, accounts, transaction } = await loadFixture(depositExchangeFixture)
                await expect(transaction).to.emit(exchange, "TokensDeposited")
                    .withArgs(await token0.getAddress(), accounts.user1.address, AMOUNT, AMOUNT)
            })
        })

        describe("Failure", () => {
            it("fails when no tokens are approved", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(deployExchangeFixture)
                const ERROR = "Exchange: Token Transfer Failed"

                await expect(exchange.connect(accounts.user1).depositTokens(await token0.getAddress(), AMOUNT)).to.be.reverted
                //With(ERROR)
            })
        })
    })
    
    describe("Withdrawing Tokens", () => {
        const AMOUNT = unitFixer(100)

        describe("Success", () => {
            it("withdraws tokens", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(depositExchangeFixture)

                // withdraws tokens here
                const withdrawal = await exchange.connect(accounts.user1).withdrawTokens(await token0.getAddress(), AMOUNT)
                await withdrawal.wait()

                expect(await token0.balanceOf(await exchange.getAddress())).to.equal(0)
                expect(await exchange.totalBalanceOf(await token0.getAddress(), accounts.user1.address)).to.equal(0)
            })

            it("emits a TokensWithdrawn event", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(depositExchangeFixture)

                // withdraws tokens here
                const withdrawal = await exchange.connect(accounts.user1).withdrawTokens(await token0.getAddress(), AMOUNT)
                await withdrawal.wait()

                await expect(withdrawal).to.emit(exchange, "TokensWithdrawn")
                    .withArgs(await token0.getAddress(), accounts.user1.address, AMOUNT, 0)
            })
        })

        describe("Failure", () => {
            it("fails for insufficient balance", async () => {
                const { tokens: { token0 }, exchange, accounts } = await loadFixture(deployExchangeFixture)
                const ERROR = "Exchange: Insufficient Funds on Exchange"

                await expect(exchange.connect(accounts.user1).withdrawTokens(await token0.getAddress(), AMOUNT)).to.be.revertedWith(ERROR)
            })
        })
    })
})

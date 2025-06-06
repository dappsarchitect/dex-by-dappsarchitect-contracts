const { ethers } = require("hardhat") // imports Ethers.js
const { deployExchangeFixture, depositExchangeFixture } = require("./helpers/ExchangeFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

async function flashLoanFixture() {
    const { tokens, exchange, accounts } = await loadFixture(depositExchangeFixture)

    const FlashLoanUser = await ethers.getContractFactory("FlashLoanUser")
    const flashLoanUser = await FlashLoanUser.connect(accounts.user1).deploy(await exchange.getAddress())

    return { tokens, exchange, accounts, flashLoanUser }
}

describe("Flash Loan Provider", () => {

    describe("Calling flashLoan Function from FlashLoanUser Contract", () => {
        const AMOUNT = unitFixer(100)

        // The following code was used for checking the borrow part of the flash loan, and it worked;
        // it is not used later since the money borrowed will be paid back when the code is finished
        //it("borrows the flash loan", async () => {
            //const { tokens: { token0 }, accounts, flashLoanUser } = await loadFixture(flashLoanFixture)
            ////console.log("Balance before: ", await token0.balanceOf(await flashLoanUser.getAddress()))
            //await flashLoanUser.connect(accounts.user1).getFlashLoan(await token0.getAddress(), AMOUNT)
            ////console.log("Balance after : ", await token0.balanceOf(await flashLoanUser.getAddress()))
            //expect(await token0.balanceOf(await flashLoanUser.getAddress())).to.equal(AMOUNT)
        //})

        describe("Success", () => {
            it("emits a FlashLoanReceived event", async () => {
                const { tokens: { token0 }, accounts, flashLoanUser } = await loadFixture(flashLoanFixture)

                await expect(flashLoanUser.connect(accounts.user1).getFlashLoan(await token0.getAddress(), AMOUNT)).to.emit(flashLoanUser, "FlashLoanReceived")
            })

            it("emits a FlashLoan event", async () => {
                const { tokens: { token0 }, exchange, accounts, flashLoanUser } = await loadFixture(flashLoanFixture)

                //const { timestamp } = await ethers.provider.getBlock()

                await expect(flashLoanUser.connect(accounts.user1).getFlashLoan(await token0.getAddress(), AMOUNT)).to.emit(exchange, "FlashLoan")
                    //.withArgs(await token0.getAddress(), AMOUNT, timestamp)
            })
        })

        describe("Failure", () => {
            it("rejects on insufficient funds", async () => {
                const { tokens: { token1 }, exchange, accounts } = await loadFixture(deployExchangeFixture)

                await expect(exchange.connect(accounts.user1).flashLoan(await token1.getAddress(), unitFixer(100), "0x")).to.be.revertedWith("FlashLoanProvider: Insufficient Funds for Loan")
            })
        })
    })
})

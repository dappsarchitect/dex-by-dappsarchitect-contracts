const { ethers } = require("hardhat") // imports Ethers.js
const { deployExchangeFixture } = require("./helpers/ExchangeFixtures")
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
})

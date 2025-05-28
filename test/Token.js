const { ethers } = require("hardhat") // imports Ethers.js
const { deployTokenFixture } = require("./helpers/TokenFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {

    it("has correct name", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.name()).to.equal("Dapps Architect") // fetches name from the blockchain and tests it
    })

    it("has correct symbol", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.symbol()).to.equal("DACT") // fetches symbol from the blockchain and tests it
    })

    it("has correct decimals", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.decimals()).to.equal(18) // fetches decimals from the blockchain and tests it
    })

    it("has correct total supply", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.totalSupply()).to.equal(unitFixer(1000000)) // fetches total supply from the blockchain and tests it to be 1000000000000000000000000
    })

})

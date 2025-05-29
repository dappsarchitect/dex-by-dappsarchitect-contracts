const { ethers } = require("hardhat") // imports Ethers.js
const { deployTokenFixture } = require("./helpers/TokenFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {
    const NAME = "Dapps Architect"
    const SYMBOL = "DACT"
    const DECIMALS = 18
    const TOTAL_SUPPLY = unitFixer(1000000)

    it("has correct name", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.name()).to.equal(NAME) // fetches name from the blockchain and tests it
    })

    it("has correct symbol", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.symbol()).to.equal(SYMBOL) // fetches symbol from the blockchain and tests it
    })

    it("has correct decimals", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.decimals()).to.equal(DECIMALS) // fetches decimals from the blockchain and tests it
    })

    it("has correct total supply", async () => {
        const { token } = await loadFixture(deployTokenFixture)
        expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY) // fetches total supply from the blockchain and tests it to be 1000000000000000000000000
    })

    it("assigns token total supply to the contract deployer", async () => {
        const { token, deployer } = await loadFixture(deployTokenFixture)
        expect(await token.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY)
    })
})

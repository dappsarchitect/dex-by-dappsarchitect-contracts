const { ethers } = require("hardhat")

async function deployExchangeFixture() {
    const Exchange = await ethers.getContractFactory("Exchange") // contract not yet on the blockchain

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const feeAccount = accounts[1]

    const FEE_PERCENT = 10

    const exchange = await Exchange.deploy(feeAccount, FEE_PERCENT) // contract deployed to the blockchain

    return { exchange, accounts: { deployer, feeAccount } }
}

module.exports = {
    deployExchangeFixture
}

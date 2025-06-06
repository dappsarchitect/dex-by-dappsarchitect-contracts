// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("ExchangeModule", (m) => {
    const DEPLOYER = m.getAccount(0)
    const FEE_ACCOUNT = m.getAccount(1)
    const FEE_PERCENT = 10

    const exchange = m.contract(
        "Exchange",
        [FEE_ACCOUNT, FEE_PERCENT],
        { from: DEPLOYER }
    )

    return { exchange }
})

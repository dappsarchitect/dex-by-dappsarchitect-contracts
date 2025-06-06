// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("UserModule", (m) => {
    const USER = m.getAccount(2)

    const EXCHANGE_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"

    const flashLoanUser = m.contract(
        "FlashLoanUser",
        [EXCHANGE_ADDRESS],
        { from: USER }
    )

    return { flashLoanUser }
})

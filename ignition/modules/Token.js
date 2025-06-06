// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

module.exports = buildModule("TokenModule", (m) => {
  const DECIMALS = 18
  const TOTAL_SUPPLY = 1000000 // one million
  const DEPLOYER = m.getAccount(0)

  const DACT = m.contract(
    "Token",
    ["Dapps Architect", "DACT", DECIMALS, TOTAL_SUPPLY],
    { from: DEPLOYER, id: "DACT" }
  )

  const IMA = m.contract(
    "Token",
    ["Imoan", "IMA", DECIMALS, TOTAL_SUPPLY],
    { from: DEPLOYER, id: "IMA" }
  )

  const NML = m.contract(
    "Token",
    ["Nomolos", "NML", DECIMALS, TOTAL_SUPPLY],
    { from: DEPLOYER, id: "NML" }
  )

  return { DACT, IMA, NML }
})

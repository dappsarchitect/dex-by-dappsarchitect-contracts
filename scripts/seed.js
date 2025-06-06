const hre = require("hardhat")

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

async function main() {
    console.log("Running seed script...") // delete later...

    // Distribute tokens
    // Deposit funds into exchange
    // Make some orders
    // Cancel some orders
    // Fill some orders
    // Perform some flash loans
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

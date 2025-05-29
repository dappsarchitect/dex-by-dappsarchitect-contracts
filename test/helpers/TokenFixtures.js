async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Token") // contract not yet on the blockchain
    const token = await Token.deploy("Dapps Architect", "DACT", 18, 1000000) // contract deployed to the blockchain

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const recipient = accounts[1]

    return { token, deployer, recipient }
}

module.exports = {
    deployTokenFixture
}

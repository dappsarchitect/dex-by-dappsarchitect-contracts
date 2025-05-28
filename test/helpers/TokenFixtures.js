async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Token") // contract not yet on the blockchain
    const token = await Token.deploy("Dapps Architect", "DACT", 18, 1000000) // contract deployed to the blockchain

    return { token }
}

module.exports = {
    deployTokenFixture
}

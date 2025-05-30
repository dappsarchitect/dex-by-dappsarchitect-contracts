async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Token") // contract not yet on the blockchain
    const token = await Token.deploy("Dapps Architect", "DACT", 18, 1000000) // contract deployed to the blockchain

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const recipient = accounts[1]
    const delegate = accounts[2]

    return { token, deployer, recipient, delegate }
}

async function transferFromTokenFixture() {
    const { token, deployer, recipient, delegate } = await deployTokenFixture()
    const AMOUNT = ethers.parseUnits("500000", 18)

    // Transaction is not needed for approval, so we wrap it in an await so we can still do .wait()
    await (await token.connect(deployer).approve(delegate.address, AMOUNT)).wait()

    const transaction = await token.connect(delegate).transferFrom(deployer.address, recipient.address, AMOUNT)
    await transaction.wait()

    return { token, deployer, recipient, delegate, transaction }
}

module.exports = {
    deployTokenFixture,
    transferFromTokenFixture
}

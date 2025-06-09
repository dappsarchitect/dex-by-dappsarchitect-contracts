const hre = require("hardhat")

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

function wait(seconds) {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
    const DACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const IMA_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    const NML_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    const EXCHANGE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const FLASH_LOAN_USER_ADDRESS = "0x663F3ad617193148711d28f5334eE4Ed07016602"

    const dact = await hre.ethers.getContractAt("Token", DACT_ADDRESS)
    console.log(`Token fetched:           ${await dact.getAddress()}`)

    const ima = await hre.ethers.getContractAt("Token", IMA_ADDRESS)
    console.log(`Token fetched:           ${await ima.getAddress()}`)

    const nml = await hre.ethers.getContractAt("Token", NML_ADDRESS)
    console.log(`Token fetched:           ${await nml.getAddress()}`)

    const exchange = await hre.ethers.getContractAt("Exchange", EXCHANGE_ADDRESS)
    console.log(`Exchange fetched:        ${await exchange.getAddress()}`)

    const flashLoanUser = await hre.ethers.getContractAt("FlashLoanUser", FLASH_LOAN_USER_ADDRESS)
    console.log(`Flash Loan User fetched: ${await flashLoanUser.getAddress()}\n`)

    const accounts = await ethers.getSigners() // fetch accounts from the wallet (unlocked)
    const deployer = accounts[0] // the main account who deploys
    const feeAccount = accounts[1] // collects fee from the exchange
    const user1 = accounts[2] // regular user
    const user2 = accounts[3] // regular user

    // The following six actions are the steps taken to seed the exchange:
    // 1. Distribute tokens
    // 2. Deposit funds into exchange (with approving first)
    // 3. Make a cancelled order
    // 4. Fill some orders
    // 5. Make some open orders
    // 6. Perform some flash loans

    // 1. Distribute tokens
    const AMOUNT = unitFixer(100000)
    let transaction

    transaction = await dact.connect(deployer).transfer(user1.address, AMOUNT)
    await transaction.wait()
    console.log(`Transferred ${AMOUNT} DACT tokens from ${deployer.address} to ${user1.address}`)

    transaction = await ima.connect(deployer).transfer(user2.address, AMOUNT)
    await transaction.wait()
    console.log(`Transferred ${AMOUNT} IMA  tokens from ${deployer.address} to ${user2.address}\n`)

    // 2. Deposit funds into exchange (with approving first)
    transaction = await dact.connect(user1).approve(EXCHANGE_ADDRESS, AMOUNT)
    await transaction.wait()
    console.log(`User1 (${user1.address}) approved  ${AMOUNT} DACT tokens to ${EXCHANGE_ADDRESS}`)

    transaction = await exchange.connect(user1).depositTokens(DACT_ADDRESS, AMOUNT)
    await transaction.wait()
    console.log(`User1 (${user1.address}) deposited ${AMOUNT} DACT tokens to ${EXCHANGE_ADDRESS}\n`)

    transaction = await ima.connect(user2).approve(EXCHANGE_ADDRESS, AMOUNT)
    await transaction.wait()
    console.log(`User2 (${user2.address}) approved  ${AMOUNT} IMA  tokens to ${EXCHANGE_ADDRESS}`)

    transaction = await exchange.connect(user2).depositTokens(IMA_ADDRESS, AMOUNT)
    await transaction.wait()
    console.log(`User2 (${user2.address}) deposited ${AMOUNT} IMA  tokens to ${EXCHANGE_ADDRESS}\n`)

    // 3. Make a cancelled order
    let orderId
    transaction = await exchange.connect(user1).makeOrder(IMA_ADDRESS, unitFixer(1), DACT_ADDRESS, unitFixer(1))
    result = await transaction.wait()
    orderId = result.logs[0].args.id
    console.log(`User1 (${user1.address}) made order with order ID ${orderId}`)

    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`User1 (${user1.address}) cancelled order with order ID ${orderId}\n`)

    await wait(1)

    // 4. Fill some orders
    for(var i=1; i<=3; i++) {
        let orderId
        transaction = await exchange.connect(user1).makeOrder(IMA_ADDRESS, unitFixer(10*i), DACT_ADDRESS, unitFixer(10*i))
        result = await transaction.wait()
        orderId = result.logs[0].args.id
        console.log(`User1 (${user1.address}) made order with order ID ${orderId}`)

        transaction = await exchange.connect(user2).fillOrder(orderId)
        result = await transaction.wait()
        console.log(`User2 (${user2.address}) filled order with order ID ${orderId}\n`)
    
        await wait(1)
    }

    // 5. Make some open orders
    for(var i=1; i<=4; i++) {
        let orderId
        transaction = await exchange.connect(user1).makeOrder(NML_ADDRESS, unitFixer(10*i), DACT_ADDRESS, unitFixer(10*i))
        result = await transaction.wait()
        orderId = result.logs[0].args.id
        console.log(`User1 (${user1.address}) made order with order ID ${orderId}`)

        await wait(1)
    }

    transaction = await exchange.connect(user1).makeOrder(NML_ADDRESS, unitFixer(50), DACT_ADDRESS, unitFixer(50))
    result = await transaction.wait()
    orderId = result.logs[0].args.id
    console.log(`User1 (${user1.address}) made order with order ID ${orderId}\n`)

    await wait(1)

    for(var i=1; i<=4; i++) {
        let orderId
        transaction = await exchange.connect(user2).makeOrder(DACT_ADDRESS, unitFixer(10*i), IMA_ADDRESS, unitFixer(10*i))
        result = await transaction.wait()
        orderId = result.logs[0].args.id
        console.log(`User2 (${user2.address}) made order with order ID ${orderId}`)

        await wait(1)
    }

    transaction = await exchange.connect(user2).makeOrder(DACT_ADDRESS, unitFixer(50), IMA_ADDRESS, unitFixer(50))
    result = await transaction.wait()
    orderId = result.logs[0].args.id
    console.log(`User2 (${user2.address}) made order with order ID ${orderId}\n`)

    await wait(1)

    // 6. Perform some flash loans
    for(var i=1; i<=3; i++) {
        transaction = await flashLoanUser.connect(user1).getFlashLoan(DACT_ADDRESS, unitFixer(1000))
        result = await transaction.wait()
        console.log(`User1 (${user1.address}) executed a flash loan`)

        await wait(1)
    }

}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

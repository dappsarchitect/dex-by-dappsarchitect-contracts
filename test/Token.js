const { ethers } = require("hardhat") // imports Ethers.js
const { deployTokenFixture, transferFromTokenFixture } = require("./helpers/TokenFixtures")
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")    // imports expect function from Chai

const unitFixer = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {

    describe("Deployment", () => {
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

    describe("Transferring Tokens", () => {

        describe("Success", () => {
            it("transfers token balances", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture)

                const transaction = await token.connect(deployer).transfer(recipient.address, unitFixer(500000))
                await transaction.wait()

                expect(await token.balanceOf(deployer.address)).to.equal(unitFixer(500000))
                expect(await token.balanceOf(recipient.address)).to.equal(unitFixer(500000))
            })

            it("emits a Transfer event", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture)

                const transaction = await token.connect(deployer).transfer(recipient.address, unitFixer(500000))
                await transaction.wait()

                await expect(transaction).to.emit(token, "Transfer")
                    .withArgs(deployer.address, recipient.address, unitFixer(500000))
            })
        })

        describe("Failure", () => {
            it("rejects insufficient balance", async () => {
                const { token, deployer, recipient } = await loadFixture(deployTokenFixture)
                const INVALID_AMOUNT = unitFixer(2000000)
                const ERROR = "Token: Insufficient Funds"

                await expect(token.connect(deployer).transfer(recipient.address, INVALID_AMOUNT)).to.be.revertedWith(ERROR)
            })

            it("rejects invalid recipient address", async () => {
                const { token, deployer } = await loadFixture(deployTokenFixture)
                const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Recipient Is Address 0"

                await expect(token.connect(deployer).transfer(INVALID_ADDRESS, unitFixer(500000))).to.be.revertedWith(ERROR)
            })
        })
    })

    describe("Approving Transferral of Tokens", () => {

        describe("Success", () => {
            it("approves transferral of tokens of certain amount", async () => {
                const { token, deployer, delegate } = await loadFixture(deployTokenFixture);

                const approval = await token.connect(deployer).approve(delegate.address, unitFixer(500000))
                await approval.wait()

                expect(await token.allowance(deployer.address, delegate.address)).to.equal(unitFixer(500000))
            })

            it("emits an Approval event", async () => {
                const { token, deployer, delegate } = await loadFixture(deployTokenFixture);

                const approval = await token.connect(deployer).approve(delegate.address, unitFixer(500000))
                await approval.wait()

                await expect(approval).to.emit(token, "Approval")
                    .withArgs(deployer.address, delegate.address, unitFixer(500000))
            })
        })

        describe("Failure", () => {
            it("rejects invalid delegate address", async () => {
                const { token, deployer } = await loadFixture(deployTokenFixture);
                const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Delegate Spender Is Address 0"

                await expect(token.connect(deployer).approve(INVALID_ADDRESS, unitFixer(500000))).to.be.revertedWith(ERROR)
            })
        })
    })

    describe("Delegated Transferral of Tokens", () => {

        describe("Success", () => {
            it("transfers token balances", async () => {
                const { token, deployer, recipient } = await loadFixture(transferFromTokenFixture)

                expect(await token.balanceOf(deployer.address)).to.equal(unitFixer(500000))
                expect(await token.balanceOf(recipient.address)).to.equal(unitFixer(500000))
            })

            it("emits a Transfer event", async () => {
                const { token, deployer, recipient, transaction } = await loadFixture(transferFromTokenFixture)

                await expect(transaction).to.emit(token, "Transfer")
                await expect(transaction).to.emit(token, "Transfer")
                    .withArgs(deployer.address, recipient.address, unitFixer(500000))
            })

            it("decreases the allowance by the right amount", async () => {
                const { token, deployer, delegate } = await loadFixture(transferFromTokenFixture)

                expect(await token.allowance(deployer.address, delegate.address)).to.equal(unitFixer(0))
            })
        })

        describe("Failure", () => {

            it("rejects invalid owner address", async () => {
                const { token, deployer, recipient, delegate } = await loadFixture(transferFromTokenFixture)
                const ALLOWANCE = unitFixer(1)
                const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Owner Is Address 0"

                await (await token.connect(deployer).approve(delegate.address, ALLOWANCE)).wait()
                await expect(token.connect(delegate).transferFrom(INVALID_ADDRESS, recipient.address, ALLOWANCE)).to.be.revertedWith(ERROR)
            })

            it("rejects non-approved delegate", async () => {
                const { token, deployer, recipient, delegate } = await loadFixture(transferFromTokenFixture)
                const AMOUNT = unitFixer(1)
                const ERROR = "Token: No Approval for Transferral"

                await expect(token.connect(delegate).transferFrom(deployer.address, recipient.address, AMOUNT)).to.be.revertedWith(ERROR)
            })

            it("rejects insufficient allowance", async () => {
                const { token, deployer, recipient, delegate } = await loadFixture(transferFromTokenFixture)
                const ALLOWANCE = unitFixer(1)
                const INVALID_AMOUNT = unitFixer(2)
                const ERROR = "Token: Insufficient Allowance"

                await (await token.connect(deployer).approve(delegate.address, ALLOWANCE)).wait()
                await expect(token.connect(delegate).transferFrom(deployer.address, recipient.address, INVALID_AMOUNT)).to.be.revertedWith(ERROR)
            })

            it("rejects insufficient balance", async () => {
                const { token, deployer, recipient, delegate } = await loadFixture(transferFromTokenFixture)
                const INVALID_AMOUNT = unitFixer(2000000)
                const ERROR = "Token: Insufficient Funds"

                await (await token.connect(deployer).approve(delegate.address, INVALID_AMOUNT)).wait()
                await expect(token.connect(delegate).transferFrom(deployer.address, recipient.address, INVALID_AMOUNT)).to.be.revertedWith(ERROR)
            })

            it("rejects invalid recipient address", async () => {
                const { token, deployer, delegate } = await loadFixture(transferFromTokenFixture)
                const ALLOWANCE = unitFixer(1)
                const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Recipient Is Address 0"

                await (await token.connect(deployer).approve(delegate.address, ALLOWANCE)).wait()
                await expect(token.connect(delegate).transferFrom(deployer.address, INVALID_ADDRESS, ALLOWANCE)).to.be.revertedWith(ERROR)
            })
        })
    })
})

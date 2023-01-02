import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const topFundersListButton = document.getElementById("topFundersListButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
topFundersListButton.onclick = printTopFunders

console.log(ethers)

async function printTopFunders() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(
        contractAddress,
        abi,
        provider.getSigner()
    )

    const topFunders = []
    for (let i = 0; i < 5; i++) {
        const address = await contract.getTopFunder(i)
        const contribution = await contract.getTopFunderContribution(address)
        topFunders.push({ address, contribution })
    }

    console.log(topFunders)

    topFundersList.innerHTML = ""
    for (const funder of topFunders) {
        const item = document.createElement("li")
        item.innerHTML = `Address: ${
            funder.address
        }, Contribution: ${ethers.utils.formatEther(funder.contribution)} ETH`
        topFundersList.appendChild(item)
    }
}

async function getBalance() {
    const balanceOutput = document.getElementById("balanceOutput")
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            balanceOutput.innerHTML = `In Fund Me contract is currently funded ${ethers.utils.formatEther(
                balance
            )} ETH.`
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask"
    }
}

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected"
            connectButton.classList.add("connected")
        } catch (error) {
            console.log(error)
            connectButton.innerHTML = "Error connecting"
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    document.getElementById(
        "transactionOutput"
    ).innerHTML = `Completed! Tx:   ${transactionResponse.hash}`
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                document.getElementById(
                    "transactionOutputScript"
                ).innerHTML = `Completed with ${transactionReceipt.confirmations} confirmations.`
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask"
    }
}

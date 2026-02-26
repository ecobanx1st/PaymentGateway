const Web3 = require('web3');

// Replace with your Ethereum node WebSocket URL (Infura, Alchemy, or local node)
const wsURL = 'https://api.wficoin.io';

// Initialize web3 instance with WebSocket provider
const web3 = new Web3(wsURL);

// Ethereum address to monitor
const address = '0x6d166112a48fcffec0a28bb8661aa20533537bc6';

// Function to get the current balance of the address
async function getBalance(address) {
    const balanceWei = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balanceWei, 'ether');
}

// Function to handle new transactions in real-time
function monitorTransactions() {
    // Subscribe to pending transactions
    web3.eth.subscribe('pendingTransactions', async (error, txHash) => {
        if (error) console.error('Error subscribing to pending transactions:', error);

        try {
            // Get transaction details
            const tx = await web3.eth.getTransaction(txHash);

            // Check if the transaction involves the monitored address
            if (tx && (tx.from === address || tx.to === address)) {
                console.log(`New Transaction:`);
                console.log(`From: ${tx.from}`);
                console.log(`To: ${tx.to}`);
                console.log(`Value: ${web3.utils.fromWei(tx.value, 'ether')} ETH`);
                console.log(`Transaction Hash: ${tx.hash}`);
                console.log('---------------------------------');

                // Get the updated balance
                const balance = await getBalance(address);
                console.log(`Updated Balance: ${balance} ETH`);
                console.log('---------------------------------');
            }
        } catch (err) {
            console.error('Error fetching transaction:', err);
        }
    });
}

// Function to start monitoring transactions and balance
async function startMonitoring() {
    const initialBalance = await getBalance(address);
    console.log(`Initial Balance of ${address}: ${initialBalance} ETH`);
    console.log('---------------------------------');

    monitorTransactions();
}

// Start monitoring
startMonitoring().catch(console.error);

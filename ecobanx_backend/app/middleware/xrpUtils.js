// xrp-utils.js
const xrpl = require("xrpl");
const Elliptic = require("elliptic");
const secp256k1 = new Elliptic.ec("secp256k1");

class XrpUtils {
    /**
     * Initialize XRP Utility class
     * @param {string} networkUrl - XRP Ledger WebSocket endpoint (e.g., wss://s.altnet.rippletest.net:51233)
     */
    constructor(networkUrl) {
        this.networkUrl = networkUrl;
        this.client = new xrpl.Client(networkUrl);
        this.connected = false;
    }

    /** Internal method to ensure connection. */
    async _connect() {
        if (!this.connected) {
            await this.client.connect();
            this.connected = true;
        }
    }

    /** Internal method to ensure safe disconnect. */
    async _disconnect() {
        if (this.connected) {
            try {
                await this.client.disconnect();
            } catch (error) {
                console.warn("⚠️ Warning: Error during disconnect:", error.message);
            }
            this.connected = false;
        }
    }

    /**
     * Get XRP balance of an account.
     * Automatically connects/disconnects.
     * @param {string} address - XRP Ledger address (e.g., rEXAMPLE...)
     * @returns {Promise<number>} Balance in XRP
     */
    async getBalance(address) {
        try {
            await this._connect();

            const response = await this.client.request({
                command: "account_info",
                account: address,
                ledger_index: "validated",
            });

            const balanceDrops = response.result.account_data.Balance;
            const balanceXRP = parseFloat(balanceDrops) / 1_000_000;

            return balanceXRP;
        } catch (error) {
            // Account not yet activated on ledger — treat as zero balance
            if (error?.data?.error === "actNotFound" || error?.message?.includes("actNotFound")) {
                return 0;
            }
            throw new Error(`Error fetching XRP balance: ${error.message}`);
        } finally {
            await this._disconnect();
        }
    }

    /**
     * Send XRP from one wallet to another.
     * @param {string} fromSecret - Sender’s secret seed or hex private key
     * @param {string} toAddress - Recipient’s classic address (starts with ‘r’)
     * @param {number} amountXrp - Amount in XRP
     * @param {boolean} deductFee - If true and balance == amount, deduct network fee from amount
     * @returns {Promise<{hash: string, explorer: string}>}
     */
    async sendXrp(fromSecret, toAddress, amountXrp, deductFee = false) {
        try {
            await this._connect();

            let wallet;

            // ✅ Detect input type and create wallet
            if (fromSecret.startsWith("s")) {
                // Base58 seed format
                wallet = xrpl.Wallet.fromSeed(fromSecret);
            } else {
                // Hex private key format (e.g. "00" + 32-byte secp256k1 hex from WalletCoreService)
                // Strip the "00" secp256k1 prefix to get the raw 32-byte private key
                const privHex = fromSecret.startsWith("00") ? fromSecret.slice(2) : fromSecret;
                const keyPair = secp256k1.keyFromPrivate(privHex, "hex");
                const publicKey = keyPair.getPublic(true, "hex").toUpperCase();
                wallet = new xrpl.Wallet(publicKey, fromSecret.toUpperCase());
            }

            // If sending full balance, autofill a temp tx to get the actual fee then deduct it
            if (deductFee) {
                const tempTx = {
                    TransactionType: "Payment",
                    Account: wallet.address,
                    Amount: xrpl.xrpToDrops(amountXrp),
                    Destination: toAddress,
                };
                const filled = await this.client.autofill(tempTx);
                const feeDrops = parseInt(filled.Fee || "12");
                const feeXrp = feeDrops / 1_000_000;
                amountXrp = amountXrp - feeXrp;
                if (amountXrp <= 0) throw new Error("Insufficient balance to cover network fee");
            }

            // Build transaction
            const tx = {
                TransactionType: "Payment",
                Account: wallet.address,
                Amount: xrpl.xrpToDrops(amountXrp), // Convert XRP → drops
                Destination: toAddress,
            };

            // Autofill fields (fee, sequence, etc.)
            const prepared = await this.client.autofill(tx);

            // Sign transaction locally
            const signed = wallet.sign(prepared);

            // Submit transaction to the network
            const result = await this.client.submitAndWait(signed.tx_blob);

            const txResult = result.result.meta.TransactionResult;
            if (txResult !== "tesSUCCESS") {
                const xrplErrorMessages = {
                    tecUNFUNDED_PAYMENT: "Insufficient XRP balance to complete the payment",
                    tecNO_DST: "Destination account does not exist on the XRP ledger",
                    tecNO_DST_INSUF_XRP: "Destination account does not exist; send at least 10 XRP to activate it",
                    tecINSUFF_FEE: "Insufficient balance to cover the transaction fee",
                    tecDST_TAG_NEEDED: "Destination requires a destination tag",
                    tecNO_PERMISSION: "Transaction not permitted",
                    temBAD_AMOUNT: "Invalid transfer amount",
                    temBAD_DESTINATION: "Invalid destination address",
                    temINSUF_FEE_P: "Transaction fee is too low",
                    terINSUF_FEE_B: "Insufficient balance to cover the fee",
                    tefPAST_SEQ: "Transaction sequence number is outdated, please retry",
                };
                const readableMessage = xrplErrorMessages[txResult] || `Transaction failed: ${txResult}`;
                throw new Error(readableMessage);
            }

            const txHash = signed.hash;

            // Explorer URL
            const explorer =
                this.networkUrl.includes("altnet") || this.networkUrl.includes("test")
                    ? `https://testnet.xrpl.org/transactions/${txHash}`
                    : `https://livenet.xrpl.org/transactions/${txHash}`;

            console.log("✅ XRP sent successfully!");
            console.log("🔗 Explorer:", explorer);

            return { hash: txHash, explorer };
        } catch (error) {
            // Re-throw already-readable errors (from our own checks) directly
            if (
                error.message.includes("Insufficient") ||
                error.message.includes("Destination") ||
                error.message.includes("Transaction failed") ||
                error.message.includes("Invalid") ||
                error.message.includes("requires a destination tag") ||
                error.message.includes("sequence number")
            ) {
                throw error;
            }
            // Wrap unexpected low-level errors
            throw new Error(`XRP transaction error: ${error.message}`);
        } finally {
            await this._disconnect();
        }
    }

}

module.exports = XrpUtils;

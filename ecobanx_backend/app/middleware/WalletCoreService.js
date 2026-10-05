const { initWasm } = require("@trustwallet/wallet-core");
const bs58 = require("bs58");

class WalletCoreService {
    static wasm = null;

    // ✅ Load WASM once
    static async init() {
        try {
            if (this.wasm) return this.wasm;
            this.wasm = await initWasm();
            return this.wasm;
        } catch (error) {
            console.log("🚀 ~ WalletCoreService ~ init ~ error:", error)

        }

    }

    /**
     * Generate address + private key from mnemonic & index
     * Supports: ETH (EVM), SOL, XRP
     * @param {string} mnemonic
     * @param {number} index
     * @param {boolean} privateKeyFlag - Whether to return private keys
     * @param {object|null} coinType - Specific CoinType (optional)
     */
    static async getAddressFromMnemonic(mnemonic, index = 0, privateKeyFlag = false, coinType = null) {
        const wasm = this.wasm || (await this.init());
        const { HDWallet, AnyAddress, CoinType } = wasm;

        if (!mnemonic) throw new Error("Mnemonic is required");
        if (index < 0) throw new Error("Index must be >= 0");

        // if (!HDWallet.isValid(mnemonic)) {
        //     throw new Error("Invalid mnemonic");
        // }
        console.log("🚀 ~ WalletCoreService ~ getAddressFromMnemonic ~ mnemonic:", mnemonic)

        const wallet = HDWallet.createWithMnemonic(mnemonic, "");

        // 🔹 EVM / Ethereum
        const generateEthereum = () => {
            const derivationPath = `m/44'/60'/0'/0/${index}`;
            const privateKey = wallet.getKey(CoinType.ethereum, derivationPath);
            const publicKey = privateKey.getPublicKeySecp256k1(true);
            const address = AnyAddress.createWithPublicKey(publicKey, CoinType.ethereum).description();
            const privHex = "0x" + Buffer.from(privateKey.data()).toString("hex");

            return privateKeyFlag
                ? { coin: "EVM", index, derivationPath, address, privateKey: privHex }
                : { coin: "EVM", address };
        };

        // 🔹 Solana
        const generateSolana = () => {
            const derivationPath = `m/44'/501'/${index}'`;
            const priv = wallet.getKey(CoinType.solana, derivationPath);
            const privSeed = Buffer.from(priv.data());
            const pub = priv.getPublicKeyEd25519 ? priv.getPublicKeyEd25519() : priv.getPublicKey();
            const pubKey = Buffer.from(pub.data());
            const secret64 = Buffer.concat([privSeed, pubKey]);
            const address = bs58.default.encode(pubKey);
            const secretKeyBase58 = bs58.default.encode(secret64);

            return privateKeyFlag
                ? {
                    coin: "SOL",
                    index,
                    derivationPath,
                    address,
                    privateKey: secretKeyBase58,
                    secretKeyHex: secret64.toString("hex"),
                }
                : { coin: "SOL", address };
        };

        // 🔹 XRP (Ripple)
        const generateXRP = () => {
            const derivationPath = `m/44'/144'/0'/0/${index}`;
            const privateKey = wallet.getKey(CoinType.xrp, derivationPath);
            const publicKey = privateKey.getPublicKeySecp256k1(true);
            const address = AnyAddress.createWithPublicKey(publicKey, CoinType.xrp).description();
            const privHex = Buffer.from(privateKey.data()).toString("hex");

            return privateKeyFlag
                ? { coin: "XRP", index, derivationPath, address, privateKey: "00" + privHex }
                : { coin: "XRP", address };
        };

        // 🔹 Tron (TRX)
        const generateTron = () => {
            const derivationPath = `m/44'/195'/0'/0/${index}`;
            const privateKey = wallet.getKey(CoinType.tron, derivationPath);
            const publicKey = privateKey.getPublicKeySecp256k1(false);
            const address = AnyAddress.createWithPublicKey(publicKey, CoinType.tron).description();
            const privHex = Buffer.from(privateKey.data()).toString("hex");

            return privateKeyFlag
                ? { coin: "TRX", index, derivationPath, address, privateKey: privHex }
                : { coin: "TRX", address };
        };

        // ✅ Return based on specific coinType if provided
        if (coinType) {
            if (coinType.value === CoinType.ethereum.value) return generateEthereum();
            if (coinType.value === CoinType.solana.value) return generateSolana();
            if (coinType.value === CoinType.xrp.value) return generateXRP();
            if (coinType.value === CoinType.tron.value) return generateTron();
            throw new Error("Unsupported coin type!");
        }

        // ✅ Return all supported coins if no coinType specified
        return {
            EVM: generateEthereum(),
            SOL: generateSolana(),
            XRP: generateXRP(),
            TRX: generateTron(),
        };
    }
}

module.exports = WalletCoreService;

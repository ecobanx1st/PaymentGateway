const mongoose = require("mongoose");
const QRCode = require("qrcode");

const { Transaction } = require("../../models/transactionModel");
const { Buyer } = require("../../models/buyerSchema");
const { Users } = require("../../models/usersModel");
const { generateCheckoutToken } = require("../../middleware/utils/pasetoService");

const {
  generateDepositAddress,
} = require("../../services/wallet/merchantWalletService");

const { WalletAddress } = require("../../models/walletAddressModel");
const { Network } = require("../../models/Network");
const { Asset } = require("../../models/Asset");
const { validateAddress } = require("../../utils/validateAddress");



const CHECKOUT_TIMEOUT_SECONDS = Number(process.env.CHECKOUT_TIMEOUT_SECONDS) || 15 * 60; // 900 seconds



const parseCoins = (coin) => {
  if (Array.isArray(coin)) {
    return [
      ...new Set(
        coin
          .map((c) => String(c).toUpperCase().trim())
          .filter(Boolean)
      ),
    ];
  }

  return [
    ...new Set(
      String(coin)
        .toUpperCase()
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    ),
  ];
};


const STATUS_MAP = {
  pending: -1,
  paid: 1,
  underpaid: 2,
  confirmed: 100,
  expired: -2,
  cancelled: -3,
};

const STATUS_TEXT = {
  pending: "Pending payment",
  paid: "Payment received, awaiting confirmations",
  underpaid: "Payment received but amount is less than expected",
  confirmed: "Payment completed successfully",
  expired: "Transaction expired",
  cancelled: "Transaction cancelled",
};



const getExpiresInSeconds = (expiresAt) => {
  if (!expiresAt) {
    return 0;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((expiresAtTime - Date.now()) / 1000)
  );
};


const checkoutTxInfo = async (req, reply) => {
  try {
    const tx = await Transaction.findOne({
      txnId: req.txnId,
    })
      .lean();

    if (!tx) {
      return reply.code(404).send({
        success: false,
        message: "Transaction not found",
      });
    }

    // --------------------------------------------------------
    // GET BUYER FROM SEPARATE COLLECTION
    // --------------------------------------------------------

    const buyer = await Buyer.findOne({
      transactionId: tx._id,
    })
      .select(
        "email firstname lastname"
      )
      .lean();

    // --------------------------------------------------------
    // CALCULATE REMAINING TIME
    // --------------------------------------------------------

    const expiresInSeconds = getExpiresInSeconds(
      tx.expiresAt
    );

    // --------------------------------------------------------
    // DETERMINE CURRENT STATUS
    // --------------------------------------------------------

    let currentStatus = tx.status;

    // Automatically report expired if time is over
    // and transaction is still pending.
    if (
      currentStatus === "pending" &&
      expiresInSeconds <= 0 &&
      tx.expiresAt
    ) {
      currentStatus = "expired";
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return reply.code(200).send({
      success: true,

      result: {
        merchant_id: tx.merchantId,

        txn_id: tx.txnId,

        time_created: tx.createdAt
          ? Math.floor(
            new Date(tx.createdAt).getTime() / 1000
          )
          : null,

        coin: tx.currency2,

        network: tx.network,

        amount: Number(tx.amountInCurrency2 || 0).toFixed(8),

        payment_address: tx.address || null,

        currency1: tx.currency1,

        currency2: tx.currency2,

        amount1: tx.amount,

        amount2: tx.amountInCurrency2,

        item_name: tx.itemName || "",
        
        item_description: tx.itemDescription || "",

        item_number: tx.itemNumber || "",

        invoice: tx.invoice || "",

        custom: tx.custom || "",

        // ----------------------------------------------------
        // BUYER DETAILS
        // ----------------------------------------------------

        buyer: {
          email: buyer?.email || "",
          firstname: buyer?.firstname || "",
          lastname: buyer?.lastname || "",
          fullName: buyer?.fullName || "",
        },

        // ----------------------------------------------------
        // EXPIRATION
        // ----------------------------------------------------

        timeout: tx.timeout || CHECKOUT_TIMEOUT_SECONDS,

        expiresAt: tx.expiresAt || null,

        expiresInSeconds,

        // ----------------------------------------------------
        // PAYMENT STATUS
        // ----------------------------------------------------

        received_amount: tx.receivedAmount ?? 0,

        confirms_needed: tx.confirmsNeeded,

        confirmations: tx.confirmations,

        status: STATUS_MAP[currentStatus] ?? -1,

        status_text:
          STATUS_TEXT[currentStatus] || "Unknown",
      },
    });
  } catch (error) {
    console.error(
      "checkoutTxInfo error:",
      error
    );

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================================
// GET / GENERATE CHECKOUT DEPOSIT ADDRESS
// ============================================================

const checkoutDepositAddress = async (req, reply) => {
  try {
    const {
      coin,
      network,
      txnId,
      buyerEmail,
      buyerFirstname,
      buyerLastname,
    } = req.body || {};

    console.log("GET DEPOSIT ADDRESS BODY:", req.body);
    console.log("txnId:", txnId);

    if (!txnId) {
      return reply.code(400).send({
        success: false,
        message: "txnId is required",
      });
    }

    const txn = await Transaction.findOne({
      txnId: String(txnId).trim(),
    });

    console.log("FOUND TRANSACTION:", txn);

    if (!txn) {
      return reply.code(404).send({
        success: false,
        message: "Transaction not found",
      });
    }

    // Always take merchantId from the transaction
    const merchantId = txn.merchantId;




    // ------------------------------------------------
    // EXPIRY
    // ------------------------------------------------

    const expiresAt = txn.expiresAt || null;
    const expiresInSeconds = getExpiresInSeconds(expiresAt);

    if (
      txn.status === "pending" &&
      expiresAt &&
      expiresInSeconds <= 0
    ) {
      await Transaction.updateOne(
        { _id: txn._id },
        {
          $set: {
            status: "expired",
          },
        }
      );

      return reply.code(410).send({
        success: false,
        message: "Transaction expired",
        status: STATUS_MAP.expired,
        status_text: STATUS_TEXT.expired,
        expiresAt,
        expiresInSeconds: 0,
        timeout:
          txn.timeout || CHECKOUT_TIMEOUT_SECONDS,
      });
    }


    const coins = parseCoins(coin);

    if (!coins.length) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: coin",
      });
    }

    // --------------------------------------------------------
    // VALIDATE NETWORK
    // --------------------------------------------------------

    if (!network) {
      return reply.code(400).send({
        success: false,
        message: "Missing required field: network",
      });
    }

    const networkSymbol = String(network)
      .toUpperCase()
      .trim();

    // --------------------------------------------------------
    // FIND NETWORK
    // --------------------------------------------------------

    const networkDoc = await Network.findOne({
      networkSymbol,
      status: true,
    }).lean();

    if (!networkDoc) {
      return reply.code(404).send({
        success: false,
        message: "Network not found",
      });
    }

    // --------------------------------------------------------
    // SAVE / UPDATE BUYER
    // Single Buyer document per transaction — upsert on
    // transactionId so a checkout refresh never duplicates it.
    // --------------------------------------------------------
    await Buyer.findOneAndUpdate(
      {
        transactionId: txn._id,
      },
      {
        $set: {
          merchantId: txn.merchantId || merchantId || null,
          email: buyerEmail,
          firstname: buyerFirstname,
          lastname: buyerLastname,

          fullName:
            `${buyerFirstname} ${buyerLastname}`.trim(),
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // --------------------------------------------------------
    // GENERATE / GET DEPOSIT ADDRESS
    // --------------------------------------------------------

    let transactionId = txn._id;

    let transaction = txn;

    const result = {};

    let firstAddress = null;

    for (const c of coins) {
      // ------------------------------------------------------
      // FIND ASSET
      // ------------------------------------------------------

      const asset = await Asset.findOne({
        assetSymbol: c,

        "networks.networkId":
          networkDoc._id,

        status: true,
      }).lean();

      if (!asset) {
        return reply.code(404).send({
          success: false,
          message:
            `Asset ${c} not found for this network`,
        });
      }

      // ------------------------------------------------------
      // CHECK DEPOSIT STATUS
      // ------------------------------------------------------

      if (!asset.depositStatus) {
        return reply.code(400).send({
          success: false,
          message:
            `Deposits are disabled for asset ${c}`,
        });
      }

      let address = null;

      const merchantAddress = await WalletAddress.findOne({
        userId: merchantId,
        networkType: networkDoc.type || networkSymbol,
      })
        .select("address")
        .lean();

      if (merchantAddress && validateAddress(merchantAddress.address, networkDoc.type || networkSymbol)) {
        address = merchantAddress.address;
      }

      if (!address && transactionId) {
        const depositAddressQuery = {
          transactionId,
          coin: c,
          $or: [
            { networkId: networkDoc._id },
            {
              network: networkSymbol,
              $or: [
                { networkId: { $exists: false } },
                { networkId: null },
              ],
            },
          ],
        };

        if (merchantId) {
          depositAddressQuery.merchantId = merchantId;
        }

        const candidates = await WalletAddress.find(
          depositAddressQuery
        )
          .select("address _id networkId network")
          .sort({ createdAt: 1 })
          .limit(10)
          .lean();

        for (const candidate of candidates) {
          if (!candidate.address) continue;

          if (validateAddress(candidate.address, networkDoc.type || networkSymbol)) {
            address = candidate.address;

            if (!candidate.networkId) {
              await WalletAddress.updateOne(
                { _id: candidate._id },
                { $set: { networkId: networkDoc._id } }
              );
            }
            break;
          }

        }
      }

      if (!address) {
        let gen = null;

        try {
          gen = await generateDepositAddress(merchantId || null, c, networkSymbol, networkDoc);
        } catch (error) {
          console.error("generateDepositAddress error:", error);

          const message =
            error.message && error.message.includes("invalid for network")
              ? error.message
              : `Failed to generate deposit address for ${c} on ${networkSymbol}`;

          return reply.code(500).send({
            success: false,
            message,
          });
        }

        if (!gen?.address) {
          return reply.code(500).send({
            success: false,
            message: `Failed to generate deposit address for ${c} on ${networkSymbol}`,
          });
        }

        if (!validateAddress(gen.address, networkDoc.type || networkSymbol)) {
          await WalletAddress.deleteOne({ _id: gen.id });

          return reply.code(500).send({
            success: false,
            message: `Generated deposit address is invalid for network ${networkSymbol}`,
          });
        }

        await WalletAddress.updateOne(
          { _id: gen.id },
          { $set: { transactionId } }
        );

        address = gen.address;
      }

      // ------------------------------------------------------
      // RESPONSE ADDRESS
      // ------------------------------------------------------

      result[c] = {
        address,
      };

      if (!firstAddress) {
        firstAddress = address;
      }
    }

    // --------------------------------------------------------
    // UPDATE TRANSACTION ADDRESS
    // --------------------------------------------------------

    if (
      transactionId &&
      firstAddress
    ) {
      await Transaction.updateOne(
        {
          _id: transactionId,
        },
        {
          $set: {
            address: firstAddress,
            network: networkSymbol,
          },
        }
      );
    }

    // --------------------------------------------------------
    // GET BUYER
    // --------------------------------------------------------

    let buyer = null;

    if (transactionId) {
      buyer = await Buyer.findOne({
        transactionId,
      })
        .select(
          "email firstname lastname fullName"
        )
        .lean();
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return reply.code(200).send({
      success: true,

      result,

      buyer: {
        email: buyer?.email || "",
        firstname:
          buyer?.firstname || "",
        lastname:
          buyer?.lastname || "",
        fullName:
          buyer?.fullName || "",
      },

      txn_id:
        transaction?.txnId || txn_id || null,

      expiresAt,

      expiresInSeconds,

      timeout:
        transaction?.timeout ||
        CHECKOUT_TIMEOUT_SECONDS,
    });
  } catch (error) {
    console.error(
      "checkoutDepositAddress error:",
      error
    );

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};




const getUserAssets = async (req, reply) => {
  try {
    const { search, networkId, depositStatus, withdrawStatus } =
      req.body;
    console.log(req.body, "req.body")

    const activeNetworks = await Network.find({ status: true })
      .select("_id")
      .lean();
    const activeNetworkIds = activeNetworks.map((n) => n._id);

    if (activeNetworkIds.length === 0) {
      return reply.code(200).send({
        success: true,
        message: "Assets fetched successfully.",
        data: [],
      });
    }

    const filter = { status: true };

    if (networkId) {
      if (!activeNetworkIds.some((id) => id.toString() === networkId)) {
        return reply.code(200).send({
          success: true,
          message: "Assets fetched successfully.",
          data: [],
        });
      }
      filter["networks.networkId"] = networkId;
    } else {
      filter["networks.networkId"] = { $in: activeNetworkIds };
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchRegex = new RegExp(safeSearch, "i");
      filter.$or = [
        { assetName: searchRegex },
        { assetSymbol: searchRegex },
      ];
    }

    if (depositStatus !== undefined && depositStatus !== "") {
      filter.depositStatus = depositStatus === "true";
    }

    if (withdrawStatus !== undefined && withdrawStatus !== "") {
      filter.withdrawStatus = withdrawStatus === "true";
    }

    const assets = await Asset.find(filter)
      .populate({
        path: "networks.networkId",
        match: { status: true },
        select: "networkName networkSymbol chainId type depositEnabled withdrawEnabled withdrawFee ",
      })
      .sort({ assetName: 1 })
      .lean();

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.body?.merchantId;
    for (const asset of assets) {
      try {
        const balance = await getBalance(userId, asset.assetSymbol);
        asset.balance = balance.totalBalance.total;
        asset.free = balance.totalBalance.free;
        asset.locked = balance.totalBalance.locked;
      } catch {
        asset.balance = 0;
        asset.free = 0;
        asset.locked = 0;
      }
    }

    return reply.code(200).send({
      success: true,
      message: "Assets fetched successfully.",
      data: assets,
    });
  } catch (error) {
    console.error("getUserAssets Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getPublicButtonTransaction = async (req, reply) => {
  try {
    const txnId = String(req.params?.txnId || "").trim();

    if (!txnId) {
      return reply.code(400).send({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const tx = await Transaction.findOne({ txnId })
      .select(
        "txnId amount amountInCurrency2 cryptoAmount currency1 currency2 network address status paymentType timeout quoteExpiresAt expiresAt confirmsNeeded successUrl cancelUrl invoice"
      )
      .lean();

    if (!tx) {
      return reply.code(404).send({
        success: false,
        message: "Transaction not found",
      });
    }

    let qrcode = null;
    if (tx.address) {
      try {
        qrcode = await QRCode.toDataURL(tx.address, {
          errorCorrectionLevel: "M",
          width: 256,
          margin: 2,
        });
      } catch (qrErr) {
        console.error("getPublicButtonTransaction qrcode failed:", qrErr?.message || qrErr);
      }
    }

    return reply.code(200).send({
      success: true,
      result: {
        invoiceId: String(tx._id),
        address: tx.address,
        txn_id: tx.txnId,
        amount: tx.amount != null ? String(tx.amount) : null,
        currency1: tx.currency1,
        crypto_amount:
          tx.cryptoAmount ??
          (tx.amountInCurrency2 != null ? String(tx.amountInCurrency2) : null),
        currency2: tx.currency2,
        network: tx.network,
        status: tx.status,
        paymentType: tx.paymentType || null,
        timeout: tx.timeout ?? null,
        quote_expires_at: tx.quoteExpiresAt
          ? new Date(tx.quoteExpiresAt).toISOString()
          : null,
        expiresAt: tx.expiresAt || tx.quoteExpiresAt || null,
        confirms_needed: tx.confirmsNeeded ?? null,
        success_url: tx.successUrl || null,
        cancel_url: tx.cancelUrl || null,
        qrcode,
        checkout_token: (await generateCheckoutToken({ txnId: tx.txnId })).accessToken,
      },
    });
  } catch (error) {
    console.error("getPublicButtonTransaction error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

const mapInvoiceDisplayStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed" || s === "completed") return "completed";
  if (s === "failed") return "failed";
  if (s === "expired") return "expired";
  if (s === "cancelled") return "failed";
  if (s === "pending") return "pending";
  if (s === "created") return "created";
  return s || "pending";
};

const getPublicInvoiceTransaction = async (req, reply) => {
  try {
    const raw = String(req.params?.invoiceId || req.params?.id || "").trim();
    if (!raw) {
      return reply.code(400).send({
        success: false,
        result: null,
        message: "Invoice ID is required",
      });
    }
    let tx = null;
    if (mongoose.Types.ObjectId.isValid(raw)) {
      tx = await Transaction.findById(raw)
        .select(
          "txnId merchantId amount amountInCurrency2 cryptoAmount currency1 currency2 network address status paymentType timeout quoteExpiresAt expiresAt buyerEmail buyerFirstname buyerLastname itemName itemNumber invoice custom item_description successUrl cancelUrl ipnUrl createdAt"
        )
        .lean();
    }
    if (!tx) {
      tx = await Transaction.findOne({ txnId: raw })
        .select(
          "txnId merchantId amount amountInCurrency2 cryptoAmount currency1 currency2 network address status paymentType timeout quoteExpiresAt expiresAt buyerEmail buyerFirstname buyerLastname itemName itemNumber invoice custom item_description successUrl cancelUrl ipnUrl createdAt"
        )
        .lean();
    }
    if (!tx) {
      return reply.code(404).send({
        success: false,
        result: null,
        message: "Invoice not found",
      });
    }
    let qrcode = null;
    if (tx.address) {
      try {
        qrcode = await QRCode.toDataURL(tx.address, {
          errorCorrectionLevel: "M",
          width: 256,
          margin: 2,
        });
      } catch (qrErr) {
        console.error("getPublicInvoiceTransaction qrcode failed:", qrErr?.message || qrErr);
      }
    }
    const displayStatus = mapInvoiceDisplayStatus(tx.status);
    // Show the merchant's public ID (e.g. USR-754A06F00F5), never the _id.
    let merchantPublicId = null;
    try {
      if (tx.merchantId) {
        const merchant = await Users.findById(tx.merchantId)
          .select("userUniqueId")
          .lean();
        if (merchant && merchant.userUniqueId) {
          merchantPublicId = String(merchant.userUniqueId);
        }
      }
    } catch (merchantErr) {
      console.error("getPublicInvoiceTransaction merchant lookup failed:", merchantErr?.message || merchantErr);
    }
    if (!merchantPublicId && tx.custom && String(tx.custom).trim()) {
      merchantPublicId = String(tx.custom).trim();
    }
    return reply.code(200).send({
      success: true,
      result: {
        invoiceId: String(tx._id),
        txn_id: tx.txnId,
        transactionId: tx.txnId,
        merchantId: merchantPublicId,
        amount: tx.amount != null ? String(tx.amount) : null,
        currency1: tx.currency1,
        crypto_amount:
          tx.cryptoAmount ??
          (tx.amountInCurrency2 != null ? String(tx.amountInCurrency2) : null),
        amountInCurrency2: tx.amountInCurrency2,
        currency2: tx.currency2,
        network: tx.network,
        address: tx.address || null,
        qrcode,
        status: tx.status,
        paymentType: tx.paymentType || null,
        displayStatus,
        timeout: tx.timeout ?? null,
        expiry: tx.quoteExpiresAt || tx.expiresAt || null,
        quote_expires_at: tx.quoteExpiresAt
          ? new Date(tx.quoteExpiresAt).toISOString()
          : null,
        expiresAt: tx.expiresAt || null,
        buyerEmail: tx.buyerEmail || null,
        buyerFirstname: tx.buyerFirstname || null,
        buyerLastname: tx.buyerLastname || null,
        itemName: tx.itemName || null,
        itemNumber: tx.itemNumber || null,
        invoice: tx.invoice || null,
        custom: tx.custom || null,
        item_description: tx.item_description || null,
        checkout_token: tx.address
          ? (await generateCheckoutToken({ txnId: tx.txnId })).accessToken
          : null,
      },
      message: "Invoice fetched successfully",
    });
  } catch (error) {
    console.error("getPublicInvoiceTransaction error:", error);
    return reply.code(500).send({
      success: false,
      result: null,
      message: "Internal server error",
    });
  }
};

module.exports = { checkoutTxInfo, checkoutDepositAddress, getUserAssets, getPublicButtonTransaction, getPublicInvoiceTransaction };

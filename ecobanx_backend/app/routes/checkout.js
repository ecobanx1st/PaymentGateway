const { verifyCheckoutToken } = require("../middleware/merchantAuth.middleware");
const { checkoutTxInfo, checkoutDepositAddress, getUserAssets, getPublicButtonTransaction, getPublicInvoiceTransaction } = require("../controllers/checkout/checkout.controller");
const { getPublicButtonMakerById } = require("../controllers/merchant/buttonMaker.controller");
const { transferTokenReceiver } = require("../controllers/merchant");
const { merchantUserDeposit } = require("../controllers/checkout/merchantUserDeposit");
const { updateInvoiceNgetAddress } = require("../controllers/merchant/updateInvoiceNgetAddress");
const { updateInvoiceNgetAddressValidator } = require("../controllers/merchant/validators/updateInvoiceNgetAddressValidator");
const { zodValidate } = require("../middleware/utils/zodValidate");
const { validateToken } = require("../middleware/authMiddleware");

module.exports = async function (fastify) {
  // fastify.get("/tx_info", {
  //   preHandler: verifyCheckoutToken,
  // }, checkoutTxInfo);

  fastify.post("/tx_info", {
    preHandler: verifyCheckoutToken,
  }, checkoutTxInfo);

  // fastify.get("/get_deposit_address", {
  //   preHandler: verifyCheckoutToken,
  // }, checkoutDepositAddress);

  fastify.post("/get_deposit_address", {
    preHandler: verifyCheckoutToken,
  }, checkoutDepositAddress);

  fastify.post("/asset/list", {
    preHandler: verifyCheckoutToken,
  }, getUserAssets);

  // Public button-maker checkout lookup (no auth — safe fields only)
  fastify.get("/button/:id", {}, getPublicButtonMakerById);

  // Public button-transaction checkout lookup (no auth — safe payment fields only)
  fastify.get("/button-txn/:txnId", {}, getPublicButtonTransaction);

  fastify.get("/invoice/:invoiceId", {}, getPublicInvoiceTransaction);

  fastify.post("/invoice/update", {
    preHandler: [
      async (req, reply) => {
        const result = await zodValidate(req, reply, updateInvoiceNgetAddressValidator);
        if (!result.success) return;
        req.validatedData = result.data;
      },
    ],
  }, updateInvoiceNgetAddress);


  fastify.post("/merchantUserDeposit", {
    preHandler: [
      // verifyCheckoutToken,
      validateToken(["user"]),
      // async (req, reply) => {
      //   const result = await zodValidate(req, reply, transferTokenReceiverValidator);
      //   if (!result.success) return;
      //   req.validatedData = result.data;
      // },
    ],
  }, merchantUserDeposit);
};
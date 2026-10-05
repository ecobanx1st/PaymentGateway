const { getCryptoQuote } = require("../../services/price/priceService");


const convertPrice = async (req, reply) => {
  try {
    const { amount, currency1, currency2 } = req.validatedData;

    const quote = await getCryptoQuote({
      fromCurrency: currency1,
      toCurrency: currency2,
      amount: String(amount),
      decimals: 8,
    });

    return reply.code(200).send({
      success: true,
      result: {
        rate: quote.rate,
        cryptoAmount: quote.cryptoAmount,
        fromCurrency: quote.fromCurrency,
        toCurrency: quote.toCurrency,
      },
    });
  } catch (error) {
    if (error?.code === "PRICE_UNAVAILABLE") {
      return reply.code(503).send({
        success: false,
        code: "PRICE_UNAVAILABLE",
        message: error.message,
      });
    }

    req.log?.error({ err: error }, "convertPrice error");
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { convertPrice };

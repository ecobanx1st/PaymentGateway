const { DepositAddress } = require("../../models/depositAddressModel");

const listDepositAddresses = async (req, reply) => {
  try {
    const merchantId = req.user.merchantId;
    const { page, limit, coin, network, address, addressIndex } = req.validatedData || req.query || {};

    const filter = { merchantId };

    if (coin) filter.coin = String(coin).toUpperCase();
    if (network) filter.network = String(network).toUpperCase();
    if (address) filter.address = { $regex: String(address), $options: "i" };
    if (addressIndex !== undefined) filter.addressIndex = parseInt(String(addressIndex), 10);

    const options = {
      page,
      limit,
      sort: { addressIndex: -1, createdAt: -1 },
      select: "coin network address addressIndex createdAt -_id",
      lean: true,
    };

    const result = await DepositAddress.paginate(filter, options);

    return reply.code(200).send({
      success: true,
      data: {
        records: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      },
    });
  } catch (error) {
    console.error("listDepositAddresses error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { listDepositAddresses };

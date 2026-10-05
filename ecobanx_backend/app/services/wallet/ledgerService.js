const { Ledger } = require("../../models/ledgerModel");

const createLedgerEntry = async ({
  merchantId,
  withdrawalId = null,
  assetSymbol,
  type,
  amount,
  balanceBefore,
  balanceAfter,
  lockedBefore = 0,
  lockedAfter = 0,
  description = "",
  session = null,
}) => {
  const doc = {
    merchantId,
    withdrawalId,
    assetSymbol,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    lockedBefore,
    lockedAfter,
    description,
  };
  if (session) {
    const [entry] = await Ledger.create([doc], { session });
    return entry;
  }
  return Ledger.create(doc);
};

module.exports = { createLedgerEntry };

export const API_DOCUMENTATION_GROUPS = [
  {
    title: "Basics",
    items: ["introduction", "authorized-token"],
  },
  {
    title: "Informational commands",
    items: ["basic-account-info", "coin-balances", "deposit-address", "deposit-address-history", "api-history"],
  },
  {
    title: "Receiving payments",
    items: ["create-transaction", "transaction-info", "transaction-list"],
  },
  {
    title: "Withdrawals & transfers",
    items: ["create-transfer", "withdrawal-history", "withdrawal-info"],
  },
];

export const API_DOCUMENTATION = [
  {
    slug: "introduction",
    title: "Introduction",
    description:
      "The Hashcodex API will provide access to our services and information to our sellers. If you would like to see a particular function added, please click the Contact menu item above. API calls are implemented as standard HTTP POST (application/x-www-form-urlencoded) calls to https://pgdemo1.hashcodex.com/api. Publickey and Privatekey need to get the bearer authentication token. Remaining all api response will get once possible to pass in header bearer token.",
    method: "GET",
    url: "https://api.ecobanx.com/v1",
    headers: [
      {
        field: "Accept",
        type: "string",
        required: true,
        description: "Set to application/json.",
      },
    ],
    parameters: [],
    requestExample: "GET /v1\nAccept: application/json",
    responseExample: {
      success: true,
      data: { message: "Welcome to the Eco Banx API" },
    },
    notes:
      "Create an API key in API Keys before calling authenticated endpoints. Keep private credentials on your server only.",
  },
  {
    slug: "authorized-token",
    title: "Get authorized token",
    description:
      "For Hashcodex users can get Authorized token by inserting public and private key in POST method.",
    method: "POST",
    url: "https://pgdemo1.hashcodex.com/merchant/get-authorized-token",
    headers: [
      {
        field: "Content-Type",
        type: "string",
        required: true,
        description: "application/json",
      },
    ],
    parameters: [{ field: "cmd", required: true, description: "login" }],
    requestExample: "{\n  \"publickey\": \"hash_pay_daYJY9WzGnT8fiUtJQSo0M-mAZJkoZvHUY\",\n  \"privatekey\": \"hash_pay_DPOSed80eyJTBWCGfrPsERhhmyjo4r23ZDW0Xytf33Ts3PdoHVoz_9r\"\n}",
    responseExample: {
      "success": true,
      "result": {
        "access_token": "Bearer v4.public.eyJpZCI6IjZhNzA2NTM4OGJiNTQ0YzNjMWRjMTg1YiIsImFhVWSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOiIyMDI2LTA4LTA0VDExOjA3OjM2LjgwOVoiLCJleHAiOiIyMDI2LTA4LTA0VDExOjIyOjM2LjgwOVoifZRJhA4HBgXs_-a88CAvQuhHyeGvZZxxRe-uN7tyBCD1jdczqf2vQuw_gWZAPc6O5r7vARK9Owv0g48J_pJrCAM",
        "refresh_token": "v4.public.eyJpZCI6IjZhNzA2NTM4OGJiNTQ0YzNjMWRjMTg1YiIsImFw0VDExOjA3OjM2LjgxMloiLCJleHAiOiIyMDI2LTA4LTExVDExOjA3OjM2LjgxMloifWV4w3--pdcwMB6Dxv0S8wk7WLtoXTbm4ZhwV3_Dln1n6ZFUp5hV0wKTiiQ98ljGVTi64oBsO7EJYyTaMuZKEw0",
        "expires_in": 899,
        "refresh_expires_in": 604799
      },
      "message": "Token generated successfully"
    },
    notes:
      "Use the returned access token in the Authorization header for all protected API requests.",
  },
  {
    slug: "basic-account-info",
    title: "Get basic account info",
    description:
      "Retrieve the profile and account status for the authenticated merchant.",
    method: "GET",
    url: "https://api.ecobanx.com/v1/account",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [],
    requestExample:
      "GET /v1/account\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    responseExample: {
      success: true,
      data: {
        merchant_id: "mrc_10842",
        business_name: "Acme Store",
        status: "active",
      },
    },
    notes: "This endpoint requires an active merchant account.",
  },
  {
    slug: "coin-balances",
    title: "Get coin balances",
    description:
      "List available and pending balances for the currencies in your wallet.",
    method: "GET",
    url: "https://api.ecobanx.com/v1/wallet/balances",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [],
    requestExample:
      "GET /v1/wallet/balances\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    responseExample: {
      success: true,
      data: [{ currency: "USDT", available: "1240.50", pending: "80.00" }],
    },
    notes: "Amounts are returned as strings to preserve decimal precision.",
  },
  {
    slug: "deposit-address",
    title: "Get deposit address",
    description: "Get a deposit address for a supported currency and network.",
    method: "POST",
    url: "https://api.ecobanx.com/v1/wallet/deposit-address",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "currency",
        type: "string",
        required: true,
        description: "The asset symbol, for example USDT.",
      },
      {
        field: "network",
        type: "string",
        required: true,
        description: "The blockchain network, for example TRC20.",
      },
    ],
    requestExample: '{\n  "currency": "USDT",\n  "network": "TRC20"\n}',
    responseExample: {
      success: true,
      data: { address: "TL8e...cD3b", currency: "USDT", network: "TRC20" },
    },
    notes:
      "Always verify that your sender uses the matching network before transferring funds.",
  },
  {
    slug: "create-transaction",
    title: "Create transaction",
    description:
      "Note: This API is for making your own custom checkout page so buyers don't have to leave your website to complete payment. 99% of the time you don't need the extra complexity and would just use a Simple or Advanced button which you can find in our Merchant Tools section.",
    method: "POST",
    url: "https://api.ecobanx.com/v1/transactions",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "amount",
        type: "number",
        required: true,
        description: "Payment amount in the selected currency.",
      },
      {
        field: "currency",
        type: "string",
        required: true,
        description: "Three-letter fiat or supported coin code.",
      },
      {
        field: "order_id",
        type: "string",
        required: true,
        description: "Your unique merchant order reference.",
      },
      {
        field: "callback_url",
        type: "string",
        required: false,
        description: "HTTPS URL to receive payment events.",
      },
    ],
    requestExample:
      '{\n  "amount": 49.99,\n  "currency": "USD",\n  "order_id": "ORD-1042",\n  "callback_url": "https://merchant.example/payments"\n}',
    responseExample: {
      success: true,
      data: {
        transaction_id: "txn_8a7c2",
        payment_url: "https://pay.ecobanx.com/txn_8a7c2",
        status: "pending",
      },
    },
    notes:
      "Store the transaction_id to reconcile payment notifications with your order.",
  },
  {
    slug: "transaction-info",
    title: "Get transaction info",
    description: "Look up the current payment status for a single transaction.",
    method: "GET",
    url: "https://api.ecobanx.com/v1/transactions/{transaction_id}",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "transaction_id",
        type: "string",
        required: true,
        description: "The Eco Banx transaction identifier.",
      },
    ],
    requestExample:
      "GET /v1/transactions/txn_8a7c2\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    responseExample: {
      success: true,
      data: {
        transaction_id: "txn_8a7c2",
        status: "completed",
        amount: "49.99",
      },
    },
    notes:
      "Use webhooks for real-time updates and this endpoint for confirmation or recovery.",
  },
  {
    slug: "transaction-list",
    title: "Get transaction list",
    description: "Retrieve your recent transactions with optional pagination.",
    method: "GET",
    url: "https://api.ecobanx.com/v1/transactions",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "page",
        type: "number",
        required: false,
        description: "Page number, beginning at 1.",
      },
      {
        field: "limit",
        type: "number",
        required: false,
        description: "Maximum records per page, up to 100.",
      },
    ],
    requestExample:
      "GET /v1/transactions?page=1&limit=20\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    responseExample: {
      success: true,
      data: {
        items: [{ transaction_id: "txn_8a7c2", status: "completed" }],
        pagination: { page: 1, total: 1 },
      },
    },
    notes: "Newest transactions are returned first.",
  },
  {
    slug: "create-transaction-without-auth",
    title: "Create Transaction(without auth)",
    description: "",
    method: "POST",
    url: "https://pgdemo1.hashcodex.com/api/create_transfer",
    headers: [],
    parameters: [],
    requestExample: "",
    responseExample: { error: "ok", result: { amount: "1.00000000", address: "ZZZ" } },
    notes: "",
  },
  {
    slug: "create-transfer",
    title: "Create transfer",
    description: "Send a supported currency to an external wallet address.",
    method: "POST",
    url: "https://api.ecobanx.com/v1/transfers",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "currency",
        type: "string",
        required: true,
        description: "Asset to transfer.",
      },
      {
        field: "amount",
        type: "number",
        required: true,
        description: "Transfer amount.",
      },
      {
        field: "address",
        type: "string",
        required: true,
        description: "Recipient wallet address.",
      },
    ],
    requestExample:
      '{\n  "currency": "USDT",\n  "amount": 25,\n  "address": "TL8e...cD3b"\n}',
    responseExample: {
      success: true,
      data: { transfer_id: "trf_b1a09", status: "processing" },
    },
    notes:
      "Transfers may require additional review according to your account permissions.",
  },
  {
    slug: "convert-coins",
    title: "Convert coins",
    description:
      "Convert one supported asset into another at the current quoted rate.",
    method: "POST",
    url: "https://api.ecobanx.com/v1/conversions",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "from_currency",
        type: "string",
        required: true,
        description: "Asset to convert from.",
      },
      {
        field: "to_currency",
        type: "string",
        required: true,
        description: "Asset to convert to.",
      },
      {
        field: "amount",
        type: "number",
        required: true,
        description: "Source amount.",
      },
    ],
    requestExample:
      '{\n  "from_currency": "BTC",\n  "to_currency": "USDT",\n  "amount": 0.001\n}',
    responseExample: {
      success: true,
      data: { conversion_id: "cnv_30d44", status: "completed" },
    },
    notes: "Rates are indicative until the conversion is accepted.",
  },
  {
    slug: "withdrawal-history",
    title: "Withdrawal history",
    description: "Retrieve the history and current status of your withdrawals.",
    method: "GET",
    url: "https://api.ecobanx.com/v1/withdrawals",
    headers: [
      {
        field: "Authorization",
        type: "string",
        required: true,
        description: "Bearer token obtained from the authorization endpoint.",
      },
    ],
    parameters: [
      {
        field: "page",
        type: "number",
        required: false,
        description: "Page number, beginning at 1.",
      },
    ],
    requestExample:
      "GET /v1/withdrawals?page=1\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...",
    responseExample: {
      success: true,
      data: [
        { withdrawal_id: "wd_95b2e", status: "completed", currency: "USDT" },
      ],
    },
    notes: "A completed withdrawal can no longer be canceled.",
  },
  {
    slug: "withdrawal-info",
    title: "Get Withdrawal Info",
    description: "",
    method: "POST",
    url: "https://pgdemo1.hashcodex.com/api/get_withdrawal_info",
    headers: [],
    parameters: [],
    requestExample: "",
    responseExample: { error: "ok", result: { time_created: 1391924372, status: 2 } },
    notes: "",
  },
  {
    slug: "deposit-address-history",
    title: "Get Deposit Address History",
    description: "List generated deposit addresses for the authenticated merchant.",
    method: "POST",
    url: "http://localhost:3700/ecobanx/merchant/deposit_addresses",
    headers: [],
    parameters: [],
    requestExample: '{\n  "cmd": "list_deposit_addresses"\n}',
    responseExample: {
      success: true,
      result: [
        {
          _id: "6a71b4c4ed8ed4ebe29733",
          coin: "USDC",
          network: "ETH",
          address: "0x6315dD41516aA25d79508F9cba647bC9563a0",
          addressIndex: 1,
          createdAt: "2026-08-04T09:45:40.776Z",
        },
      ],
    },
    notes: "",
  },
  {
    slug: "api-history",
    title: "API history",
    description: "View recent API request records with pagination.",
    method: "GET",
    url: "http://localhost:3700/ecobanx/merchant/api-history?limit=50&skip=0",
    headers: [],
    parameters: [],
    requestExample: "GET /merchant/api-history?limit=50&skip=0",
    responseExample: {
      success: true,
      data: {
        records: [
          {
            _id: "6a71d801606135ff991307b6",
            endpoint: "/ecobanx/merchant/deposit_addresses",
            method: "POST",
            requestBody: { cmd: "list_deposit_addresses" },
            responseStatus: 200,
            success: true,
            message: "Success",
            ip: "::1",
            createdAt: "2026-08-04T12:16:01.886Z",
            id: "6a71d801606135ff991307b6",
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 148,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    },
    notes: "",
  },
];

const HIDDEN_API_SLUGS = new Set(["create-transaction-without-auth", "convert-coins"]);

const CATEGORY_BY_SLUG = Object.fromEntries(
  API_DOCUMENTATION_GROUPS.flatMap((group) =>
    group.items.map((slug) => [slug, group.title]),
  ),
);

const THREE_PAGE_CONTENT = {
  "basic-account-info": {
    title: "Get Basic Account Info",
    description: "",
    contentSections: [
      {
        heading:
          "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Get Basic Account Information",
        rows: [{ field: "cmd", description: "get_basic_info", required: true }],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "coin-balances": {
    title: "Get Coin Balances",
    description: "",
    contentSections: [
      {
        heading:
          "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Coin Balances",
        rows: [
          { field: "cmd", description: "balances", required: true },
          {
            field: "all",
            description:
              "If set to 1, the response will include all coins, even those with a 0 balance.",
            required: false,
          },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "deposit-address": {
    title: "Get Deposit Address",
    description:
      "Addresses returned by this API are for personal use deposits and reuse the same personal address(es) in your wallet. Deposits to these addresses don't send IPNs. For commercial-use addresses and/or ones that send IPNs see 'get_callback_address'.",
    contentSections: [
      {
        heading:
          "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Get Deposit Address",
        rows: [
          { field: "cmd", description: "get_deposit_address", required: true },
          {
            field: "currency",
            description: "The currency the buyer will be sending.",
            required: false,
          },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "create-transaction": {
    title: "Create Transaction",
    description: "Note: This API is for making your own custom checkout page so buyers don't have to leave your website to complete payment. 90% of the time you don't need the extra complexity and would just use a Simple or Advanced button which you can find in our Merchant Tools section.",
    contentSections: [
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Create Fixed-Price Transaction",
        rows: [
          { field: "cmd", description: "create_transaction", required: true },
          { field: "amount", description: "The amount of the transaction in the original currency (currency1 below).", required: true },
          { field: "currency1", description: "The original currency of the transaction.", required: true },
          { field: "currency2", description: "The currency the buyer will be sending. For example if your products are priced in USD but you are receiving BTC, you would use currency1=USD and currency2=BTC. currency1 and currency2 can be set to the same thing if you don't need currency conversion.", required: true },
          { field: "buyer_email", description: "Set the buyer's email address. This will let us send them a notice if they underpay or need a refund. We will not add them to our mailing list or spam them or anything like that.", required: true },
          { field: "address", description: "Optionally set the address to send the funds to (if not set will use the settings you have set on the 'Coins Acceptance Settings' page). Remember: this must be an address in currency2's network.", required: false },
          { field: "buyer_name", description: "Optionally set the buyer's name for your reference.", required: false },
          { field: "item_name", description: "Item name for your reference, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "item_number", description: "Item number for your reference, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "invoice", description: "Another field for your use, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "custom", description: "Another field for your use, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "ipn_url", description: "URL for your IPN callbacks. If not set it will use the IPN URL in your Edit Settings page if you have one set.", required: true },
          { field: "success_url", description: "Sets a URL to go to if the buyer does complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)", required: false },
          { field: "cancel_url", description: "Sets a URL to go to if the buyer does not complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)", required: false },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "transaction-info": {
    title: "Get TX Info",
    description: "",
    contentSections: [
      { heading: "Notes", text: "If at all possible you should use the Instant Payment Notification (IPN) system to receive notifications about payments instead of using this polled interface." },
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Get Multiple Transaction Information",
        rows: [
          { field: "cmd", description: "get_tx_info_multi", required: true },
          { field: "txid", description: "Lets you query up to 25 transaction ID(s) (API key must belong to the seller). Transaction IDs should be separated with a | (pipe symbol) Note: It is recommended to handle IPNs instead of using this command when possible, it is more efficient and places less load on our servers.", required: true },
        ],
        extraLabel: "Get Transaction Information",
        extraRows: [
          { field: "cmd", description: "get_tx_info", required: true },
          { field: "txid", description: "The transaction ID to query (API key must belong to the seller). Note: It is recommended to handle IPNs instead of using this command when possible, it is more efficient and places less load on our servers.", required: true },
          { field: "full", description: "Set to 1 to also include the raw checkout and shipping data for the payment if available. (default: 0)", required: false },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "transaction-list": {
    title: "Get TX List",
    description: "",
    contentSections: [
      { heading: "Notes", text: "If at all possible you should use the Instant Payment Notification (IPN) system to receive notifications about payments instead of using this polled interface." },
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Get Transaction IDs",
        rows: [
          { field: "cmd", description: "get_tx_ids", required: true },
          { field: "limit", description: "The maximum number of transaction IDs to return from 1-100. (default: 25)", required: false },
          { field: "start", description: "What transaction # to start from (for iteration/pagination) (default: 0, starts with your newest transactions)", required: false },
          { field: "all", description: "By default we return an array of TX IDs where you are the seller for use with get_tx_info_multi or get_tx_info. If all is set to 1 returns an array with TX IDs and whether you are the seller or buyer for the transaction.", required: false },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "create-transaction-without-auth": {
    title: "Create Transaction(without auth)",
    description: "Note: This API is for making your own custom checkout page so buyers don't have to leave your website to complete payment. 99% of the time you don't need the extra complexity and would just use a Simple or Advanced button which you can find in our Merchant Tools section.",
    contentSections: [
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Create Fixed-Price Transaction",
        rows: [
          { field: "cmd", description: "create_transaction", required: true },
          { field: "amount", description: "The amount of the transaction in the original currency.", required: true },
          { field: "coin", description: "The name of the coin.", required: true },
          { field: "merchant_id", description: "The Merchant id of the user.", required: true },
          { field: "network", description: "The Network of the coin (like ERC20,TRC20,BEP20)", required: true },
          { field: "currency", description: "The name of the currency you need to convert (like USD,EUR)", required: false },
          { field: "buyer_email", description: "Set the buyer's email address. This will let us send them a notice if they underpay or need a refund. We will not add them to our mailing list or spam them or anything like that.", required: false },
          { field: "address", description: "Optionally set the address to send the funds to (if not set will use the settings you have set on the 'Coins Acceptance Settings' page). Remember: this must be an address in coin's network.", required: false },
          { field: "buyer_name", description: "Optionally set the buyer's name for your reference.", required: false },
          { field: "item_name", description: "Item name for your reference, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "item_number", description: "Item number for your reference, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "invoice", description: "Another field for your use, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "custom", description: "Another field for your use, will be on the payment information page and in the IPNs for the transaction.", required: false },
          { field: "ipn_url", description: "URL for your IPN callbacks. If not set it will use the IPN URL in your Edit Settings page if you have one set.", required: true },
          { field: "success_url", description: "Sets a URL to go to if the buyer does complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)", required: false },
          { field: "cancel_url", description: "Sets a URL to go to if the buyer does not complete payment. (Only if you use the returned 'checkout_url', no effect/need if designing your own checkout page.)", required: false },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
      { heading: "API Response", text: "A successful call to get the 'create_transaction' command will give you a result similar to this (JSON):" },
      { text: "The result will have the following fields:", bullets: ["amount = The amount for the buyer to send in the destination currency", "address = The address the buyer needs to send the coins to.", "dest_tag = The tag buyers need to attach for the payment to complete. (only included for coins that require them such as XRP/XMR/etc.)", "txn_id = The hashcodex.com transaction ID.", "confirms_needed = The number of confirms needed for the transaction to be complete.", "timeout = How long the buyer has to send the coins and have them be confirmed in seconds.", "checkout_url = While normally you would be designing the full checkout experience on your site you can use this URL to provide the final payment page to the buyer.", "status_url = A longer-term URL where the buyer can view the payment status and leave feedback for you. This would typically be emailed to the buyer.", "qrcode_url = A URL to a QR code you can display for buyer's paying with a QR supporting wallet."] },
    ],
  },
  "create-transfer": {
    title: "Create Transfer",
    description: "",
    contentSections: [
      { heading: "Notes", text: "Transfers are performed as internal coin transfers/accounting entries when possible. For coins not supported that ability a withdrawal is created." },
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Create Transfer",
        rows: [
          { field: "cmd", description: "create_transfer", required: true },
          { field: "amount", description: "The amount of the transfer in the currency below.", required: true },
          { field: "currency", description: "The cryptocurrency to withdraw. (BTC)", required: true },
          { field: "merchant", description: "The merchant ID to send the funds to, either this OR pbntag must be specified. Remember: this is a merchant ID and not a username.", required: "See Desc" },
          { field: "toaddress", description: "The toaddress to send the funds to, either this OR merchant must be specified.", required: "See Desc" },
          { field: "auto_confirm", description: "If set to 1, withdrawal will complete without email confirmation.", required: false },
          { field: "Network", description: "Currency Network-> Available networks are ERC20,TRC20,BEP20", required: true },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
      { heading: "API Response", text: "A successful call to get the 'create_transfer' command will give you a result similar to this (JSON):" },
      { text: "The result will have the following fields:", bullets: ["id = The Hashcodex transfer/withdrawal ID. (This is not a coin network TX ID.)", "status = 0 or 1. 0 = Transfer created, waiting for email confirmation. 1 = Transfer created with no email confirmation needed."] },
    ],
  },
  "convert-coins": {
    title: "Convert Coins",
    description: "",
    contentSections: [
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Convert Coins",
        rows: [
          { field: "cmd", description: "convert", required: true },
          { field: "to", description: "The cryptocurrency to convert to. (USD, NGN, etc.)", required: true },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "withdrawal-history": {
    title: "Get Withdrawal History",
    description: "",
    contentSections: [
      {
        heading: "API POST Fields (in addition to the Main Fields described in the Introduction)",
        tableLabel: "Get Withdrawal History",
        rows: [
          { field: "cmd", description: "get_withdrawal_history", required: true },
          { field: "limit", description: "The maximum number of withdrawals to return from 1-100. (default: 25)", required: false },
          { field: "start", description: "What withdrawals # to start from (for iteration/pagination) (default: 0, starts with your newest withdrawals)", required: false },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
    ],
  },
  "withdrawal-info": {
    title: "Get Withdrawal Info",
    description: "",
    contentSections: [
      {
        heading: "API POST Fields (in addition to the Main Fields described in the )",
        tableLabel: "Get Withdrawal Information",
        rows: [
          { field: "cmd", description: "get_withdrawal_info", required: true },
          { field: "id", description: "The withdrawal ID to query.", required: true },
        ],
      },
      { label: "Method", backendKey: "method" },
      { label: "Url", backendKey: "url" },
      { heading: "API Response", text: "A successful call to get the 'get_withdrawal_info' command will give you a result similar to this (JSON):" },
      { text: "The result will have the following fields:", bullets: ["time_created = The time the withdrawal request was submitted.", "status = The status of the withdrawal (-1 = Cancelled, 0 = Waiting for email confirmation, 1 = Pending, 2 = Complete).", "status_text = The status of the withdrawal in text format.", "coin = The ticker symbol of the coin for the withdrawal.", "amount = The amount of the withdrawal (in Satoshis).", "amountf = The amount of the withdrawal (as a floating point number).", "send_address = The address the withdrawal was sent to. (only in response if status == 2)", "send_txid = The coin TX ID of the send. (only in response if status == 2)"] },
    ],
  },
};

const BASICS_VISUAL_GUIDES = {
  introduction: {
    flow: [
      {
        icon: "settings",
        title: "Create a merchant account",
        description:
          "Start inside the Hashcodex merchant dashboard. This is where your store, wallet, permissions, and API keys are managed.",
      },
      {
        icon: "keys",
        title: "Generate API keys",
        description:
          "Open API Keys, create a key pair, copy publickey and privatekey, then enable the commands this key is allowed to use.",
      },
      {
        icon: "token",
        title: "Get an access token",
        description:
          "Call Get authorized token with publickey and privatekey. The response gives you the bearer token for protected APIs.",
      },
      {
        icon: "request",
        title: "Send API requests",
        description:
          "Choose an endpoint, set headers, send the JSON body, then read the response in the right panel.",
      },
    ],
    cardsTitle: "API basics from scratch",
    cards: [
      {
        icon: "server",
        label: "Base URL",
        value: "http://localhost:3700/ecobanx",
        description:
          "This is the server host. Each API page adds its own path after this base URL.",
      },
      {
        icon: "endpoint",
        label: "Endpoint",
        value: "/merchant/{command-name}",
        description:
          "An endpoint is the exact API address you call, such as /merchantApi/get-authorized-token.",
      },
      {
        icon: "body",
        label: "Body",
        value: "JSON data you send",
        description:
          "The body contains the input values the API needs, such as keys, amount, currency, txid, or withdrawal id.",
      },
      {
        icon: "token",
        label: "Token",
        value: "Authorization: Bearer <access_token>",
        description:
          "Most APIs need the token in the Authorization header. Get this token from the authorization API first.",
      },
    ],
    environment: [
      {
        key: "baseUrl",
        value: "http://localhost:3700/ecobanx",
        description: "Postman replaces {{baseUrl}} in every endpoint URL.",
      },
      {
        key: "accessToken",
        value: "v4.public.eyJpZCI6IjZhNzA2NTM4OGJiNTQOYj...",
        description: "Save the access token returned from Generate Token For Merchants.",
      },
      {
        key: "secretKey",
        value: "hash_pay_DPOSed80eyJTBWCGfrPsERhhmyjo4r23ZDW0Xytf33Ts3PdoHVoz_9r",
        description: "Used by the pre-request script to create the HMAC signature.",
      },
      {
        key: "timestamp",
        value: "adsfasyfytf23yt1fyt",
        description: "The script updates this before each signed request.",
      },
      {
        key: "nonce",
        value: "dfsacdfyt23fqytf23ytf21y2",
        description: "The script updates this before each signed request.",
      },
      {
        key: "signature",
        value: "dvwshgvahwgehwqvhgy2hg3h1v3h1vhgyhgw",
        description: "The script updates this before each signed request.",
      },
    ],
    postman: {
      mode: "setup",
      script: "const CryptoJS = require(\"crypto-js\");\n\nconst timestamp = Math.floor(Date.now() / 1000).toString();\nconst nonce = Math.random().toString(36).substring(2) + Date.now();\n\nconst resolvedBody = pm.variables.replaceIn(pm.request.body.raw);\n\nconst body = JSON.stringify(JSON.parse(resolvedBody));\n\nconst secretKey = pm.environment.get(\"secretKey\");\n\nconst dataToSign = `${timestamp}${nonce}${body}`;\n\nconst signature = CryptoJS.HmacSHA256(\n    dataToSign,\n    secretKey\n).toString(CryptoJS.enc.Hex);\n\npm.environment.set(\"timestamp\", timestamp);\npm.environment.set(\"nonce\", nonce);\npm.environment.set(\"signature\", signature);",
    },
    fieldsTitle: "Common words used in every API page",
    fields: [
      {
        field: "method",
        required: true,
        description:
          "The request action. These merchant examples mostly use POST, meaning you send data to the API server.",
      },
      {
        field: "endpoint",
        required: true,
        description:
          "The exact URL for the API operation. Example: {{baseUrl}}/merchant/get-authorized-token.",
      },
      {
        field: "headers",
        required: true,
        description:
          "Extra request information. JSON APIs need Content-Type. Protected APIs also need Authorization.",
      },
      {
        field: "body",
        required: true,
        description:
          "The JSON payload you send. Each API page shows exactly which body fields are required.",
      },
      {
        field: "response",
        required: true,
        description:
          "The JSON returned by the API. Read error first, then read result for the useful data.",
      },
    ],
    sendPath: [
      {
        icon: "request",
        title: "Your app",
        description: "Builds the endpoint, headers, and JSON body.",
      },
      {
        icon: "server",
        title: "Hashcodex API",
        description: "Checks token, permissions, command, and request values.",
      },
      {
        icon: "response",
        title: "JSON response",
        description: "Returns error and result so your app can continue the payment flow.",
      },
    ],
    responseMeaning: [
      {
        label: "error",
        description:
          "Read this first. If it is ok, the API call worked. If it contains a message, fix that issue before continuing.",
      },
      {
        label: "result",
        description:
          "This contains the useful data returned by the API, such as token, balance, address, transaction, or withdrawal details.",
      },
      {
        label: "Next API call",
        description:
          "After you understand this flow, open Get authorized token and create your first real API request.",
      },
    ],
    nextStep:
      "Open Get authorized token, send your publickey and privatekey, then copy the access token for the other merchant APIs.",
  },
  "authorized-token": {
    flow: [
      {
        icon: "keys",
        title: "Copy keys from dashboard",
        description:
          "Go to API Keys, create a key pair, copy publickey and privatekey, and enable the API permissions you need.",
      },
      {
        icon: "settings",
        title: "Set Postman environment",
        description:
          "Create baseUrl, publickey, privatekey, and accessToken variables so requests are easy to repeat.",
      },
      {
        icon: "send",
        title: "Send token request",
        description:
          "POST the JSON body to the token endpoint. This request does not need Authorization because it creates the token.",
      },
      {
        icon: "token",
        title: "Save access token",
        description:
          "Copy result.access_token into the accessToken environment variable and use it for protected APIs.",
      },
    ],
    cardsTitle: "What this API is for",
    cards: [
      {
        icon: "token",
        label: "Purpose",
        value: "Creates bearer token",
        description:
          "This API converts your publickey and privatekey into an access token for merchant API calls.",
      },
      {
        icon: "secure",
        label: "Auth required",
        value: "No bearer token needed",
        description:
          "This is the first call. It creates the token, so it only needs publickey and privatekey in the body.",
      },
      {
        icon: "request",
        label: "Used before",
        value: "Balances, transactions, withdrawals",
        description:
          "Call this before any protected API that asks for Authorization: Bearer <access_token>.",
      },
      {
        icon: "server",
        label: "Call from",
        value: "Backend server",
        description:
          "Do not expose privatekey in frontend JavaScript, browser dev tools, or public HTML.",
      },
    ],
    environment: [
      {
        key: "baseUrl",
        value: "https://pgdemo1.hashcodex.com",
        description: "Postman will replace {{baseUrl}} in the endpoint URL.",
      },
      {
        key: "publickey",
        value: "hash_pay_public_key_here",
        description: "Replace with the public key from your merchant dashboard.",
      },
      {
        key: "privatekey",
        value: "hash_pay_private_key_here",
        description: "Replace with the private key from your merchant dashboard.",
      },
      {
        key: "accessToken",
        value: "empty until this API returns a token",
        description: "Fill this after the token response is successful.",
      },
    ],
    postman: {
      method: { backendKey: "method" },
      endpoint: { value: "{{baseUrl}}/merchantApi/get-authorized-token" },
      params: [],
      auth: {
        type: "No Auth",
        value: "No token required",
        description: "This endpoint creates the access token, so no bearer token is needed yet.",
      },
      headers: [
        {
          key: "Content-Type",
          value: "application/json",
          description: "Tells the API that your request body is JSON.",
        },
      ],
      body: "{\n  \"publickey\": \"hash_pay_daYJY9WzGnT8fiUtJQSo0M-mAZJkoZvHUY\",\n  \"privatekey\": \"hash_pay_DPOSed80eyJTBWCGfrPsERhhmyjo4r23ZDW0Xytf33Ts3PdoHVoz_9r\"\n}",
      note:
        "No Authorization header is required for this first request. Authorization starts after the access token is returned.",
    },
    fieldsTitle: "Body fields",
    fields: [
      {
        field: "publickey",
        required: true,
        description:
          "Your public API key. In Postman, store it as {{publickey}} so you do not paste it into every request.",
      },
      {
        field: "privatekey",
        required: true,
        description:
          "Your private API key. Keep it secret. In real apps, this value should only exist on your backend server.",
      },
    ],
    sendPath: [
      {
        icon: "body",
        title: "Body sent",
        description: "publickey and privatekey are sent as JSON.",
      },
      {
        icon: "secure",
        title: "Keys checked",
        description: "The API verifies that the key pair belongs to an allowed merchant.",
      },
      {
        icon: "token",
        title: "Token returned",
        description: "The API sends back result.access_token for protected requests.",
      },
    ],
    responseMeaning: [
      {
        label: "success: true",
        description: "The key pair was accepted and the token was created.",
      },
      {
        label: "result.access_token",
        description:
          "Copy this bearer token into the accessToken environment variable for protected API calls.",
      },
      {
        label: "message",
        description:
          "Read this text for the human-friendly status, such as Token generated successfully.",
      },
    ],
    nextStep:
      "After this succeeds, open Get basic account info or Get coin balances and add Authorization: Bearer {{accessToken}} in the headers.",
  },
};
const POSTMAN_BASE_ENVIRONMENT = [
  {
    key: "baseUrl",
    value: "http://localhost:3700/ecobanx",
    description: "Postman replaces {{baseUrl}} in every endpoint URL.",
  },
];

const PROTECTED_API_HEADERS = [
  {
    key: "Content-Type",
    value: "application/json",
    description: "Tells the API that your request body is JSON.",
  },
  {
    key: "Authorization",
    value: "Bearer {{accessToken}}",
    description: "Bearer token from Generate Token For Merchants.",
  },
  {
    key: "X-TIMESTAMP",
    value: "{{timestamp}}",
    description: "Generated by the Postman pre-request script.",
  },
  {
    key: "X-NONCE",
    value: "{{nonce}}",
    description: "Generated by the Postman pre-request script.",
  },
  {
    key: "X-SIGNATURE",
    value: "{{signature}}",
    description: "Generated by the Postman pre-request script.",
  },
];

const PROTECTED_API_AUTH = {
  type: "Bearer Token",
  value: "Bearer {{accessToken}}",
  description: "Use the access token returned from Generate Token For Merchants.",
};

const MERCHANT_API_GUIDES = {
  "basic-account-info": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_basic_info" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_basic_info"\n}',
      response: {
        success: true,
        result: {
          email: "mark.ecobanx@gmail.com",
          phone: "+919158736807",
          company_name: "Microtek",
          created_at: "2026-08-03T09:54:00.832Z",
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching basic merchant account information.", example: "get_basic_info" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether the request was processed successfully." },
      { label: "result.email", description: "Merchant account email address." },
      { label: "result.phone", description: "Merchant phone number." },
      { label: "result.company_name", description: "Company name stored on the merchant account." },
      { label: "result.created_at", description: "Account creation timestamp." },
    ],
  },
  "coin-balances": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/balances" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_balances"\n}',
      response: {
        success: true,
        result: {
          USDT: { balance: 10500 },
          USDC: { balance: 0 },
          UNI: { balance: 0 },
          BNB: { balance: 0 },
          ETH: { balance: 0 },
          POL: { balance: 0 },
          SHIB: { balance: 0 },
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching merchant coin balances.", example: "get_balances" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether balances were returned successfully." },
      { label: "result", description: "Object keyed by coin symbol. Each coin contains its balance value." },
      { label: "balance", description: "Available balance for that coin." },
    ],
  },
  "transaction-list": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_tx_info_multi" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_tx_info_multi"\n}',
      response: {
        success: true,
        result: [
          {
            id: 1,
            time_created: 1785837476,
            coin: "USDT",
            network: null,
            order_id: "txn_5f2fa109ea01f22411eabfc1c8fa4",
            transaction_hash: null,
            transaction_url: null,
            amount: "100.00000000",
            payment_address: null,
            currency1: "USDT",
            currency2: "USDT",
            amount1: 100,
            amount2: 100,
            subtotal: 100,
            item_name: "Premium Widget",
            item_amount: 100,
            status: -1,
            status_text: "Pending payment",
          },
        ],
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching multiple transaction records.", example: "get_tx_info_multi" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether transaction records were returned." },
      { label: "result", description: "Array of transaction records." },
      { label: "order_id", description: "Merchant transaction/order reference." },
      { label: "status_text", description: "Readable payment status." },
    ],
  },
  "deposit-address-history": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/deposit_addresses" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "list_deposit_addresses"\n}',
      response: {
        success: true,
        result: [
          {
            _id: "6a71b4c4ed8ed4ebe29733",
            coin: "USDC",
            network: "ETH",
            address: "0x6315dD41516aA25d79508F9cba647bC9563a0",
            addressIndex: 1,
            createdAt: "2026-08-04T09:45:40.776Z",
          },
        ],
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for listing saved deposit addresses.", example: "list_deposit_addresses" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether deposit address history was returned." },
      { label: "result", description: "Array of generated deposit address records." },
      { label: "address", description: "Wallet address generated for the coin/network." },
      { label: "createdAt", description: "Time when the address was created." },
    ],
  },
  "api-history": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "GET" },
      endpoint: { value: "{{baseUrl}}/merchant/api-history?limit=50&skip=0" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS.filter((header) => header.key !== "Content-Type"),
      response: {
        success: true,
        data: {
          records: [
            {
              _id: "6a71d801606135ff991307b6",
              endpoint: "/ecobanx/merchant/deposit_addresses",
              method: "POST",
              requestBody: { cmd: "list_deposit_addresses" },
              responseStatus: 200,
              success: true,
              message: "Success",
              ip: "::1",
              createdAt: "2026-08-04T12:16:01.886Z",
              id: "6a71d801606135ff991307b6",
            },
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 148,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
      },
    },
    fields: [],
    responseMeaning: [
      { label: "success", description: "Shows whether API history was returned successfully." },
      { label: "data.records", description: "List of API request history records." },
      { label: "data.pagination", description: "Pagination details for the history list." },
    ],
  },
  "withdrawal-history": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_withdrawal_history" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_withdrawal_history",\n  "limit": 25,\n  "start": 0\n}',
      response: {
        success: true,
        result: [
          {
            id: "6a71d50deb6f41605c7f1a71",
            time_created: 1785845005,
            status: 1,
            status_text: "Pending",
            coin: "USDT",
            network: "ETH",
            amount: 50000000000,
            amountf: "500.00000000",
            send_address: "0xD45C7105a46aC2a2Fb1e91bd865e41d58410771f",
            destination_address: "0xuyfuifgiylrfilfludluylufi;rf7f8797",
            send_txid: null,
            fee: 0,
          },
        ],
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching withdrawal history.", example: "get_withdrawal_history" },
      { field: "limit", type: "number", required: true, description: "Number of records to return.", example: "25" },
      { field: "start", type: "number", required: true, description: "Starting offset for records.", example: "0" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether withdrawal history was returned." },
      { label: "result", description: "Array of withdrawal records." },
      { label: "status_text", description: "Readable withdrawal status." },
      { label: "amountf", description: "Formatted withdrawal amount." },
    ],
  },
  "deposit-address": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_deposit_address" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_deposit_address",\n  "coin": "USDT",\n  "network": "ERC"\n}',
      response: {
        success: true,
        result: {
          USDC: {
            address: "0x4b414FCecd09FE278C16A4435CbE66edF37C41F3",
          },
          ETH: {
            address: "0x4Dc0B031bdb04e7F942c46729dB02253F54fA357",
          },
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for creating or fetching a deposit address.", example: "get_deposit_address" },
      { field: "coin", type: "string", required: true, description: "Coin symbol for the deposit address.", example: "USDT" },
      { field: "network", type: "string", required: true, description: "Network for the deposit address.", example: "ERC" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether the deposit address request was processed successfully." },
      { label: "result", description: "Object keyed by supported coin or network symbol." },
      { label: "address", description: "Deposit wallet address returned for that coin/network." },
    ],
  },
  "create-transfer": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/create_transfer" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "create_transfer",\n  "amount": 100,\n  "currency": "ETH",\n  "network": "ETH",\n  "toaddress": "0xosdihg09ewhgiasdg0isdh",\n  "auto_confirm": 1,\n  "ipn_url": "https://myshop.com/ipn"\n}',
      response: {
        success: true,
        result: {
          id: "6a71de97f877165bb1697662",
          status: 1,
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for creating a withdrawal transfer.", example: "create_transfer" },
      { field: "amount", type: "number", required: true, description: "Amount to withdraw.", example: "100" },
      { field: "currency", type: "string", required: true, description: "Coin symbol to withdraw.", example: "ETH" },
      { field: "network", type: "string", required: true, description: "Network used for withdrawal.", example: "ETH" },
      { field: "toaddress", type: "string", required: true, description: "Destination wallet address.", example: "0xosdihg09ewhgiasdg0isdh" },
      { field: "auto_confirm", type: "number", required: false, description: "Whether to auto-confirm the transfer.", example: "1" },
      { field: "ipn_url", type: "string", required: false, description: "IPN callback URL for transfer updates.", example: "https://myshop.com/ipn" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether the transfer request was created successfully." },
      { label: "result.id", description: "Withdrawal transfer ID returned by the API." },
      { label: "result.status", description: "Numeric transfer status. In this sample, 1 means the transfer is pending." },
    ],
  },
  "create-transaction": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/create_transaction" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "create_transaction",\n  "amount": 20,\n  "currency1": "INR",\n  "currency2": "USDT",\n  "network": "ERC20",\n  "buyer_email": "buyer@example.com",\n  "buyer_firstname": "John",\n  "buyer_lastname": "Doe",\n  "full_name": "John Doe",\n  "buyer_name": "John",\n  "item_name": "Premium Widget",\n  "item_number": "PW-001",\n  "invoice": "INV-2026-001",\n  "custom": "order-ref-12345",\n  "ipn_url": "https://myshop.com/ipn",\n  "success_url": "https://myshop.com/success",\n  "cancel_url": "https://myshop.com/cancel"\n}',
      response: {
        success: true,
        result: {
          amount: 100,
          currency1: "USD",
          amountInCurrency2: 100,
          currency2: "USDT",
          exchangeRate: 1,
          txn_id: "txn_76637e0609d6d111f001702aaafa939a",
          confirms_needed: 12,
          timeout: 900,
          checkoutUrl: "http://localhost:3000/User/mywallet/txn_76637e0609d6d111f001702aaafa939a",
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for creating a transaction.", example: "create_transaction" },
      { field: "amount", type: "number", required: true, description: "Payment amount.", example: "20" },
      { field: "currency1", type: "string", required: true, description: "Original payment currency.", example: "INR" },
      { field: "currency2", type: "string", required: true, description: "Crypto currency to receive.", example: "USDT" },
      { field: "network", type: "string", required: true, description: "Network for the payment coin.", example: "ERC20" },
      { field: "buyer_email", type: "string", required: false, description: "Buyer email address.", example: "buyer@example.com" },
      { field: "invoice", type: "string", required: false, description: "Merchant invoice reference.", example: "INV-2026-001" },
      { field: "ipn_url", type: "string", required: false, description: "IPN callback URL.", example: "https://myshop.com/ipn" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether the transaction was created successfully." },
      { label: "result.amount", description: "Amount requested for the transaction." },
      { label: "result.currency2", description: "Crypto currency selected for payment." },
      { label: "result.txn_id", description: "Transaction ID generated by the API." },
      { label: "result.checkoutUrl", description: "Checkout URL where the user can complete the payment." },
    ],
  },
  "transaction-info": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_tx_info" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_tx_info",\n  "txid": "txn_43a2339cc65c6743a1dbe5fb73314005"\n}',
      response: {
        success: true,
        result: {
          txn_id: "txn_43a2339cc65c67dbe5fb73314005",
          time_created: 1785398976,
          coin: "USDT",
          network: "ERC20",
          amount: "100.00000000",
          payment_address: "0x68A438e49d0Aa485648814e3eE2eFcE930",
          currency1: "USD",
          currency2: "USDT",
          amount1: 100,
          amount2: 100,
          item_name: "Premium Widget",
          item_number: "PW-001",
          invoice: "INV-2026-001",
          custom: "order-ref-12345",
          ipn_url: "https://myshop.com/ipn",
          received_amount: 1,
          confirms_needed: 12,
          confirmations: 0,
          status: 100,
          status_text: "Payment completed successfully",
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching one transaction.", example: "get_tx_info" },
      { field: "txid", type: "string", required: true, description: "Transaction ID to look up.", example: "txn_43a2339cc65c6743a1dbe5fb73314005" },
    ],
    responseMeaning: [
      { label: "success", description: "Shows whether transaction details were returned." },
      { label: "result.txn_id", description: "Transaction identifier returned by the API." },
      { label: "payment_address", description: "Payment address assigned to the transaction." },
      { label: "status_text", description: "Readable transaction status." },
    ],
  },
  "withdrawal-info": {
    environment: POSTMAN_BASE_ENVIRONMENT,
    postman: {
      method: { value: "POST" },
      endpoint: { value: "{{baseUrl}}/merchant/get_withdrawal_info" },
      auth: PROTECTED_API_AUTH,
      headers: PROTECTED_API_HEADERS,
      body: '{\n  "cmd": "get_withdrawal_info",\n  "id": "6a69ad0a02dcf98aed9045ca"\n}',
      response: {
        error: "ok",
        result: {
          time_created: 1391924372,
          status: 2,
        },
      },
    },
    fields: [
      { field: "cmd", type: "string", required: true, description: "Command name for fetching one withdrawal record.", example: "get_withdrawal_info" },
      { field: "id", type: "string", required: true, description: "Withdrawal ID to query.", example: "6a69ad0a02dcf98aed9045ca" },
    ],
    responseMeaning: [
      { label: "error", description: "Shows whether the withdrawal info request succeeded." },
      { label: "result.time_created", description: "Time when the withdrawal request was created." },
      { label: "result.status", description: "Numeric withdrawal status." },
    ],
  },
};
// This is the frontend-managed documentation copy. It remains separate from
// API_DOCUMENTATION_BACKEND so a live backend can replace only those values.
export const API_DOCUMENTATION_DATA = API_DOCUMENTATION.filter((document) => !HIDDEN_API_SLUGS.has(document.slug)).map(
  ({ method, url, responseExample, ...document }) => ({
    ...document,
    ...THREE_PAGE_CONTENT[document.slug],
    category: CATEGORY_BY_SLUG[document.slug],
    visualGuide: BASICS_VISUAL_GUIDES[document.slug] || MERCHANT_API_GUIDES[document.slug] || null,
    contentSections:
      document.slug === "introduction"
        ? [
          {
            heading: "API Setup",
            text: "The only setup needed is to go to the API Keys page and generate an API key. You will be given a private and public key used to authenticate your API calls. Make sure you don't share your private key with any 3rd parties!.User can able to create a maximum of 10 API Keys.",
            note: "Note: You must click 'Edit Permissions' to enable most commands",
          },
          {
            heading: "API Response",
            text: "The API will return an array with 1 or 2 elements: 'error' and 'result'. The result will always have an 'error' field. If its value is 'ok' (case-sensitive) the API call was a success, otherwise it will contain an error message. If there is data to return to you, it will be stored as an array in the 'result' element.",
          },
          {
            heading: "API POST Fields",
            text: "API calls are made as basic HTTP POST requests using the following variables: (note: The POST data is regular application/x-www-form-urlencoded style data, not JSON or XML)",
            tableLabel: "Main Fields",
            tableDescription: "These fields will be here for all calls.",
            rows: [
              { field: "version", description: "1", required: true },
              {
                field: "key",
                description: "Your API public key",
                required: true,
              },
              {
                field: "cmd",
                description: "The API you are calling",
                required: true,
              },
              {
                field: "nonce",
                description:
                  "Optional nonce (an integer that is always higher than in your previous API call) to prevent replay attacks. This is optional when you use it but the key it must always be used with that key from then on. Note: API nonce processing is non-atomic so you always want to wait for an API call to return before making another.",
                required: false,
              },
              {
                field: "format",
                description:
                  "The format of response to return, json or xml. (default: json)",
                required: false,
              },
            ],
          },
        ]
        : document.slug === "authorized-token"
          ? [
            {
              text: "Once user gets the Authorized bearer token it will be used for getting account info,user balances,receiving payments etc.",
            },
            {
              heading: "API POST Fields",
              tableLabel: "Get Authorized Information",
              rows: [{ field: "cmd", description: "login", required: true }],
            },
            { label: "Method", backendKey: "method" },
            { label: "Url", backendKey: "url" },
            { heading: "Requested Params", text: "publickey,privatekey" },
          ]
          : THREE_PAGE_CONTENT[document.slug]?.contentSections || null,
  }),
);

// Replace this dummy object with an API call later. Its shape deliberately
// contains only the backend-owned endpoint values.
export const API_DOCUMENTATION_BACKEND = Object.fromEntries(
  API_DOCUMENTATION.filter((document) => !HIDDEN_API_SLUGS.has(document.slug)).map((document) => [
    document.slug,
    document.slug === "introduction"
      ? null
      : {
        method: "POST",
        url:
          {
            "basic-account-info":
              "https://pgdemo1.hashcodex.com/api/get_basic_info",
            "coin-balances": "https://pgdemo1.hashcodex.com/api/balances",
            "deposit-address":
              "https://pgdemo1.hashcodex.com/api/get_deposit_address",
            "create-transaction":
              "https://pgdemo1.hashcodex.com/api/create_transfer",
            "transaction-info": "https://pgdemo1.hashcodex.com/api/get_tx_info",
            "transaction-list": "https://pgdemo1.hashcodex.com/api/get_tx_ids",
            "create-transfer": "https://pgdemo1.hashcodex.com/api/create_transfer",
            "convert-coins": "https://pgdemo1.hashcodex.com/api/convert",
            "withdrawal-history": "https://pgdemo1.hashcodex.com/api/get_withdrawal_history",
          }[document.slug] || document.url,
        response: document.slug === "create-transfer" ? { error: "ok", result: { id: "string", status: 0 } } : document.responseExample,
      },
  ]),
);

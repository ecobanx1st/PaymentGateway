export const PAGE_ROUTES = {
  settings: { label: "Settings", href: "/settings" },
  account: { label: "Account", href: "/account" },
  dashboard: { label: "Dashboard", href: "/dashboard" },
  merchants: { label: "Client Management", href: "/merchants" },
  transactions: { label: "API Transactions", href: "/transactions" },
  network: { label: "Network", href: "/network" },
  assets: { label: "Assets", href: "/assets" },
  settlements: { label: "Settlements", href: "/settlements" },
  refunds: { label: "Refund Management", href: "/refunds" },
  paymentMethods: { label: "Payment Methods", href: "/payment-methods" },
  kyc: { label: "KYC Verification", href: "/kyc" },
  kyb: { label: "KYB Verification", href: "/kyb" },
  fraud: { label: "Fraud Detection", href: "/fraud" },
  withdrawfee: { label: "Withdraw Limit", href: "/withdrawfee" },
  payin: { label: "Payin", href: "/payin" },
  payout: { label: "Payout", href: "/payout" },
  deposit: { label: "Deposit", href: "/deposit" },
  withdraw: { label: "Withdraw", href: "/withdraw" },
  invoice: { label: "Invoice", href: "/invoice" },
  ipnhistory: { label: "IPN History", href: "/ipnhistory" },
  customers: { label: "Customers", href: "/customers" },
  support: { label: "Support Tickets", href: "/support" },
  supportCategory: { label: "Support Category", href: "/support-category" },
  notifications: { label: "Notifications", href: "/notifications" },
  reports: { label: "Reports", href: "/reports" },
  apiManagement: { label: "API Management", href: "/api-management" },
  roles: { label: "Roles & Permissions", href: "/roles" },
  logout: { label: "Logout", href: "/auth/login" },
};

export const CHILD_PAGE_ROUTES = {
  merchantOnboard: { label: "Onboard Merchant", href: "/merchants/onboard" },
  merchantBusinessInfo: {
    label: "Business Information",
    href: "/merchants/onboard/business-information",
  },
  merchantOwnerDetails: {
    label: "Owner Details",
    href: "/merchants/onboard/owner-details",
  },
  merchantSettlementDetails: {
    label: "Settlement Details",
    href: "/merchants/onboard/settlement-details",
  },
  merchantApiConfiguration: {
    label: "API Configuration",
    href: "/merchants/onboard/api-configuration",
  },
  merchantKycDocumentation: {
    label: "KYC Documentation",
    href: "/merchants/onboard/kyc-documentation",
  },
  merchantProcessing: {
    label: "Onboard Merchant Processing",
    href: "/merchants/onboard/processing",
  },
  runSettlementBatch: {
    label: "Run Settlement Batch",
    href: "/settlements/run-batch",
  },
  newSupportTicket: {
    label: "New Support Ticket",
    href: "/support/new-ticket",
  },
  generateApiKey: {
    label: "Generate New API Key",
    href: "/api-management/generate-api-key",
  },
  inviteTeamMember: {
    label: "Invite Team Member",
    href: "/roles/invite-team-member",
  },
};

const ALL_ROUTES = [
  ...Object.values(PAGE_ROUTES),
  ...Object.values(CHILD_PAGE_ROUTES),
];

export const PROTECTED_ROUTES = ALL_ROUTES.map((route) => route.href);

export const PAGE_LABELS = Object.fromEntries(
  ALL_ROUTES.map((route) => [route.href, route.label]),
);

export const SIDEBAR_SECTIONS = [
  {
    title: "Overview",
    items: [{ ...PAGE_ROUTES.dashboard, icon: "dashboard" }],
  },
  {
    title: "Operations",
    items: [
      { ...PAGE_ROUTES.merchants, icon: "merchants" },

      { ...PAGE_ROUTES.network, icon: "network" },
      { ...PAGE_ROUTES.assets, icon: "assets" },
      { ...PAGE_ROUTES.withdrawfee, icon: "withdrawfee" },
      // { ...PAGE_ROUTES.settlements, icon: "settlements" },
      // { ...PAGE_ROUTES.refunds, icon: "refund" },
      // { ...PAGE_ROUTES.paymentMethods, icon: "payment" },
    ],
  },
  {
    title: "Risk & Compliance",
    items: [
      { ...PAGE_ROUTES.kyc, icon: "shield" },
      { ...PAGE_ROUTES.kyb, icon: "kyb" },
      // { ...PAGE_ROUTES.fraud, icon: "fraud" },
    ],
  },
  {
    title: "History",
    items: [
      // { ...PAGE_ROUTES.payin, icon: "payin" },
      // { ...PAGE_ROUTES.payout, icon: "payout" },
      { ...PAGE_ROUTES.deposit, icon: "deposit" },
      { ...PAGE_ROUTES.withdraw, icon: "withdraw" },
      // { ...PAGE_ROUTES.transactions, icon: "transactions" },
      // { ...PAGE_ROUTES.invoice, icon: "invoice" },
      // { ...PAGE_ROUTES.ipnhistory, icon: "ipnhistory" },
    ],
  },
  {
    title: "Customers & Support",
    items: [
      // { ...PAGE_ROUTES.customers, icon: "customers" },
      { ...PAGE_ROUTES.support, icon: "support" },
      { ...PAGE_ROUTES.supportCategory, icon: "supportCategory" },
      { ...PAGE_ROUTES.notifications, icon: "bell" },
    ],
  },
  // {
  //   title: "Insights",
  //   items: [{ ...PAGE_ROUTES.reports, icon: "reports" }],
  // },
  {
    title: "Configuration",
    items: [
      // { ...PAGE_ROUTES.apiManagement, icon: "api" },
      // { ...PAGE_ROUTES.roles, icon: "roles" },
      { ...PAGE_ROUTES.settings, icon: "settings" },
      { ...PAGE_ROUTES.logout, icon: "logout" },
    ],
  },
];

export const TABS = [
  { key: "profile", label: "Profile" },
  // { key: "notifications", label: "Notifications" },
  // { key: "preferences", label: "Preferences" },
  // { key: "danger", label: "Danger zone" },
];

export const USER_PROFILE = {
  fullName: "Avery Carter",
  email: "avery.carter@ecobanx.co",
  businessName: "",
  phone: "+1(415)555-0182",
  role: "VP/Finance",
  avatar: "",
};

export const ROLE_OPTIONS = [
  { value: "vp-finance", label: "VP/Finance" },
  { value: "admin", label: "Admin" },
  { value: "finance-manager", label: "Finance Manager" },
  { value: "support-lead", label: "Support Lead" },
];

export const NOTIFICATION_SETTINGS = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Transaction alerts and receipts",
    defaultChecked: true,
  },
  {
    key: "smsAlerts",
    label: "SMS alerts",
    description: "High-value and failed transactions",
    defaultChecked: false,
  },
  {
    key: "slackIntegration",
    label: "Slack integration",
    description: "Push notifications to your workspace",
    defaultChecked: true,
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "Summary of key activity every Monday",
    defaultChecked: true,
  },
];

export const LANGUAGE_OPTIONS = [
  { value: "en-us", label: "English (US)" },
  { value: "en-gb", label: "English (UK)" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export const TIMEZONE_OPTIONS = [
  { value: "pst", label: "UTC -08:00 Pacific Time" },
  { value: "mst", label: "UTC -07:00 Mountain Time" },
  { value: "cst", label: "UTC -06:00 Central Time" },
  { value: "est", label: "UTC -05:00 Eastern Time" },
];

export const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "ngn", label: "NGN" },
];

export const APPEARANCE_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export const DEFAULT_PREFERENCES = {
  language: LANGUAGE_OPTIONS[0],
  timezone: TIMEZONE_OPTIONS[0],
  currency: CURRENCY_OPTIONS[0],
  appearance: APPEARANCE_OPTIONS[1],
};

"use client";

import {
  ArrowLeft,
  BellRing,
  Braces,
  CircleHelp,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CodeBlock,
  MethodBadge,
  ParameterTable,
} from "../api-documentation/components/Common";

const phpHmacExample = `$merchant_id = 'Your_Merchant_ID';
$secret = 'Your_IPN_Secret';

if (!isset($_SERVER['HTTP_HMAC']) || empty($_SERVER['HTTP_HMAC'])) {
  die("No HMAC signature sent");
}

$merchant = isset($_POST['merchant']) ? $_POST['merchant']:'';
if (empty($merchant)) {
  die("No Merchant ID passed");
}

if ($merchant != $merchant_id) {
  die("Invalid Merchant ID");
}

$post_hmac = "merchant=".$merchant."&txn_id=".$txn_id."&amount1=".$amount1."&amount2=".$amount2."&currency1=".$currency1."&currency2=".$currency2."&status=".$status;
$hmac = hash_hmac("sha512", $post_hmac, trim($secret));
if ($hmac != $_SERVER['HTTP_HMAC']) {
  die("HMAC signature does not match");
}`;

const statusRows = [
  { field: "-1", description: "Cancelled / Timed Out", required: "Failure" },
  { field: "0", description: "Waiting for buyer funds", required: "Pending" },
  {
    field: "1",
    description: "We have confirmed coin reception from the buyer",
    required: "Pending",
  },
  {
    field: "2",
    description:
      "Queued for nightly payout (if you have the Payout Mode for this coin set to Nightly)",
    required: "Pending",
  },
  {
    field: "100",
    description:
      "Payment Complete. We have sent your coins to your payment address or 3rd party payment system reports the payment complete",
    required: "Complete",
  },
];

const futureProofRows = [
  { field: "<0", description: "Failures/Errors", required: "Failure" },
  {
    field: "0-99",
    description: "Payment is Pending in some way",
    required: "Pending",
  },
  {
    field: ">=100",
    description: "Payment completed successfully",
    required: "Complete",
  },
];

const requiredFields = [
  { field: "ipn_version", description: "1.0", required: true },
  {
    field: "ipn_type",
    description:
      "Currently: 'simple, 'button', 'cart', 'donation', 'deposit', or 'api'",
    required: true,
  },
  { field: "ipn_mode", description: "Currently: 'hmac'", required: true },
  {
    field: "ipn_id",
    description: "The unique identifier of this IPN",
    required: true,
  },
  {
    field: "merchant",
    description: "Your merchant ID (you can find this on the My Account page).",
    required: true,
  },
];

const depositFields = [
  {
    field: "txn_id",
    description: "The coin transaction ID of the payment.",
    required: true,
  },
  {
    field: "address",
    description: "Coin address the payment was received on.",
    required: true,
  },
  {
    field: "dest_tag",
    description:
      "For coins that use an extra tag it will include it here. For example Ripple Destination Tag, Monero Payment ID, etc.",
    required: false,
  },
  {
    field: "status",
    description:
      "Numeric status of the payment, currently 0 = pending and 100 = confirmed/complete. For future proofing you should use the same logic as Payment Statuses. IMPORTANT: You should never ship/release your product until the status is >= 100",
    required: true,
  },
  {
    field: "status_text",
    description:
      "A text string describing the status of the payment. (useful for displaying in order comments)",
    required: true,
  },
  {
    field: "currency",
    description: "The coin the buyer paid with.",
    required: true,
  },
  {
    field: "confirms",
    description: "The number of confirms the payment has.",
    required: true,
  },
  {
    field: "amount",
    description: "The total amount of the payment",
    required: true,
  },
  {
    field: "amounti",
    description: "The total amount of the payment in Satoshis",
    required: true,
  },
  {
    field: "fee",
    description:
      "The fee deducted by paymentgatewaydemo (only sent when status >= 100)",
    required: false,
  },
  {
    field: "feei",
    description:
      "The fee deducted by paymentgatewaydemo in Satoshis (only sent when status >= 100)",
    required: false,
  },
  {
    field: "fiat_coin",
    description:
      "The ticker code of the fiat currency you selected on the Merchant Settings tab of the Account Settings page (USD, EUR, etc.) Make sure to check this for accuracy for security in your IPN handler!",
    required: true,
  },
  {
    field: "fiat_amount",
    description:
      "The total amount of the payment in the fiat currency you selected on the Merchant Settings tab of the Account Settings page.",
    required: true,
  },
  {
    field: "fiat_amounti",
    description:
      "The total amount of the payment in the fiat currency you selected in Satoshis",
    required: true,
  },
  {
    field: "fiat_fee",
    description:
      "The fee deducted by paymentgatewaydemo in the fiat currency you selected (only sent when status >= 100)",
    required: false,
  },
  {
    field: "fiat_feei",
    description:
      "The fee deducted by paymentgatewaydemo in the fiat currency you selected in Satoshis (only sent when status >= 100)",
    required: false,
  },
];

const withdrawalFields = [
  {
    field: "id",
    description:
      "The ID of the withdrawal ('id' field returned from 'create_withdrawal'.)",
    required: true,
  },
  {
    field: "status",
    description:
      "Numeric status of the withdrawal, currently 0 = waiting email confirmation, 1 = pending, and 2 = sent/complete.",
    required: true,
  },
  {
    field: "status_text",
    description: "A text string describing the status of the withdrawal.",
    required: true,
  },
  {
    field: "address",
    description: "Coin address the withdrawal was sent to.",
    required: true,
  },
  {
    field: "txn_id",
    description: "The coin transaction ID of the withdrawal.",
    required: false,
  },
  {
    field: "currency",
    description: "The coin of the withdrawal.",
    required: true,
  },
  {
    field: "amount",
    description: "The total amount of the withdrawal",
    required: true,
  },
  {
    field: "amounti",
    description: "The total amount of the withdrawal in Satoshis",
    required: true,
  },
];

const buyerFields = [
  {
    field: "first_name",
    description:
      "Buyer's first name. Note: Only first_name or last_name is required, either may be empty but not both.",
    required: true,
  },
  {
    field: "last_name",
    description:
      "Buyer's last name. Note: Only first_name or last_name is required, either may be empty but not both.",
    required: true,
  },
  { field: "company", description: "Buyer's company name.", required: false },
  { field: "email", description: "Buyer's email address.", required: true },
];

const shippingFields = [
  {
    field: "address1",
    description: "Street / address line 1",
    required: false,
  },
  {
    field: "address2",
    description: "Street / address line 2",
    required: false,
  },
  { field: "city", description: "City", required: false },
  { field: "state", description: "State / Province", required: false },
  { field: "zip", description: "Zip / Postal Code", required: false },
  {
    field: "country",
    description:
      "Country of Residence. This uses 2 digit ISO 3166 country codes.",
    required: false,
  },
  {
    field: "country_name",
    description:
      "Country of Residence. This is a pretty version such as UNITED STATES or CANADA.",
    required: false,
  },
  { field: "phone", description: "Phone Number", required: false },
];

const simpleFields = [
  {
    field: "status",
    description: "The status of the payment. See Payment Statuses for details.",
    required: true,
  },
  {
    field: "status_text",
    description:
      "A text string describing the status of the payment. (useful for displaying in order comments)",
    required: true,
  },
  {
    field: "txn_id",
    description:
      "The unique ID of the payment. Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.",
    required: true,
  },
  {
    field: "currency1",
    description:
      "The original currency/coin submitted in your button. Note: Make sure you check this, a malicious user could have changed it manually.",
    required: true,
  },
  {
    field: "currency2",
    description: "The coin the buyer chose to pay with.",
    required: true,
  },
  {
    field: "amount1",
    description:
      "The total amount of the payment in your original currency/coin.",
    required: true,
  },
  {
    field: "amount2",
    description:
      "The total amount of the payment in the buyer's selected coin.",
    required: true,
  },
  {
    field: "subtotal",
    description:
      "The subtotal of the order before shipping and tax in your original currency/coin.",
    required: true,
  },
  {
    field: "shipping",
    description:
      "The shipping charged on the order in your original currency/coin.",
    required: true,
  },
  {
    field: "tax",
    description: "The tax on the order in your original currency/coin.",
    required: true,
  },
  {
    field: "fee",
    description: "The fee on the payment in the buyer's selected coin.",
    required: true,
  },
  {
    field: "net",
    description:
      "The net amount you received of the buyer's selected coin after our fee and any coin TX fees to send the coins to you.",
    required: true,
  },
  {
    field: "item_amount",
    description: "The amount of the item/order in the original currency/coin.",
    required: true,
  },
  {
    field: "item_name",
    description: "The name of the item that was purchased.",
    required: true,
  },
  {
    field: "item_desc",
    description: "Description of the item that was purchased.",
    required: false,
  },
  {
    field: "item_number",
    description:
      "This is a passthru variable for your own use. [visible to buyer]",
    required: false,
  },
  {
    field: "invoice",
    description:
      "This is a passthru variable for your own use. [not visible to buyer]",
    required: false,
  },
  {
    field: "custom",
    description:
      "This is a passthru variable for your own use. [not visible to buyer]",
    required: false,
  },
  {
    field: "on1",
    description:
      "1st option name. This lets you pass through a buyer option like size or color.",
    required: "No (unless ov1 set)",
  },
  {
    field: "ov1",
    description:
      "1st option value. This would be the buyer's selection such as small, large, red, white.",
    required: false,
  },
  {
    field: "on2",
    description:
      "2nd option name. This lets you pass through a buyer option like size or color.",
    required: "No (unless ov2 set)",
  },
  {
    field: "ov2",
    description:
      "2nd option value. This would be the buyer's selection such as small, large, red, white.",
    required: false,
  },
  {
    field: "send_tx",
    description:
      "The TX ID of the payment to the merchant. Only included when 'status' >= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.",
    required: false,
  },
  {
    field: "received_amount",
    description:
      "The amount of currency2 received at the time the IPN was generated.",
    required: false,
  },
  {
    field: "received_confirms",
    description:
      "The number of confirms of 'received_amount' at the time the IPN was generated.",
    required: false,
  },
];

const advancedFields = [
  ...simpleFields.filter(
    (row) => !["item_amount", "item_desc"].includes(row.field),
  ),
  {
    field: "item_amount",
    description: "The amount per-item in the original currency/coin.",
    required: true,
  },
  {
    field: "quantity",
    description: "The quantity of items bought.",
    required: true,
  },
  { field: "extra", description: "A note from the buyer.", required: false },
];

const cartFields = [
  ...simpleFields.filter(
    (row) =>
      ![
        "net",
        "item_amount",
        "item_name",
        "item_desc",
        "item_number",
        "on1",
        "ov1",
        "on2",
        "ov2",
      ].includes(row.field),
  ),
  {
    field: "item_name_#",
    description:
      "The name of the item that was purchased. The # starts with 1.",
    required: true,
  },
  {
    field: "item_amount_#",
    description: "The amount per-item in the original currency/coin.",
    required: true,
  },
  {
    field: "item_quantity_#",
    description: "The quantity of items bought.",
    required: true,
  },
  {
    field: "item_number_#",
    description:
      "This is a passthru variable for your own use. [visible to buyer]",
    required: false,
  },
  {
    field: "item_on1_#",
    description:
      "1st option name. This lets you pass through a buyer option like size or color.",
    required: "No (unless ov1 set)",
  },
  {
    field: "item_ov1_#",
    description:
      "1st option value. This would be the buyer's selection such as small, large, red, white.",
    required: false,
  },
  {
    field: "item_on2_#",
    description:
      "2nd option name. This lets you pass through a buyer option like size or color.",
    required: "No (unless ov2 set)",
  },
  {
    field: "item_ov2_#",
    description:
      "2nd option value. This would be the buyer's selection such as small, large, red, white.",
    required: false,
  },
  { field: "extra", description: "A note from the buyer.", required: false },
];

const donationFields = [
  ...simpleFields.filter(
    (row) => !["net", "item_amount", "item_desc"].includes(row.field),
  ),
  {
    field: "net",
    description:
      "The net amount you received of the buyer's selected coin after our fee and any coin TX fees to send the coins to you.",
    required: true,
  },
  {
    field: "item_name",
    description: "The name of the donation.",
    required: true,
  },
  { field: "extra", description: "A note from the donator.", required: false },
];

const apiFields = [
  {
    field: "status",
    description: "The status of the payment. See Payment Statuses for details.",
    required: true,
  },
  {
    field: "status_text",
    description:
      "A text string describing the status of the payment. (useful for displaying in order comments)",
    required: true,
  },
  {
    field: "txn_id",
    description:
      "The unique ID of the payment. Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.",
    required: true,
  },
  {
    field: "currency1",
    description: "The original currency/coin submitted.",
    required: true,
  },
  {
    field: "currency2",
    description: "The coin the buyer paid with.",
    required: true,
  },
  {
    field: "amount1",
    description: "The amount of the payment in your original currency/coin.",
    required: true,
  },
  {
    field: "amount2",
    description: "The amount of the payment in the buyer's coin.",
    required: true,
  },
  {
    field: "fee",
    description: "The fee on the payment in the buyer's selected coin.",
    required: true,
  },
  {
    field: "buyer_name",
    description: "The name of the buyer.",
    required: false,
  },
  { field: "email", description: "Buyer's email address.", required: false },
  {
    field: "item_name",
    description: "The name of the item that was purchased.",
    required: false,
  },
  {
    field: "item_number",
    description: "This is a passthru variable for your own use.",
    required: false,
  },
  {
    field: "invoice",
    description: "This is a passthru variable for your own use.",
    required: false,
  },
  {
    field: "custom",
    description: "This is a passthru variable for your own use.",
    required: false,
  },
  {
    field: "send_tx",
    description:
      "The TX ID of the payment to the merchant. Only included when 'status' >= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.",
    required: false,
  },
  {
    field: "received_amount",
    description:
      "The amount of currency2 received at the time the IPN was generated.",
    required: false,
  },
  {
    field: "received_confirms",
    description:
      "The number of confirms of 'received_amount' at the time the IPN was generated.",
    required: false,
  },
];

const ipnTables = [
  {
    title: "Required Fields",
    description: "These fields will be here for all IPN types.",
    rows: requiredFields,
  },
  { title: "Deposit Information (ipn_type = 'deposit')", rows: depositFields },
  {
    title: "Withdrawal Information (ipn_type = 'withdrawal')",
    rows: withdrawalFields,
  },
  {
    title: "Buyer Information (ipn_type = 'simple','button','cart','donation')",
    rows: buyerFields,
  },
  {
    title:
      "Shipping Information (ipn_type = 'simple','button','cart','donation')",
    description:
      "If 'want_shipping' was set to 1 we will collect and forward shipping information, but as always they could have manually messed with your button so be sure to verify it.",
    rows: shippingFields,
  },
  { title: "Simple Button Fields (ipn_type = 'simple')", rows: simpleFields },
  {
    title: "Advanced Button Fields (ipn_type = 'button')",
    rows: advancedFields,
  },
  {
    title: "Shopping Cart Button Fields (ipn_type = 'cart')",
    rows: cartFields,
  },
  {
    title: "Donation Button Fields (ipn_type = 'donation')",
    rows: donationFields,
  },
  {
    title: "API Generated Transaction Fields (ipn_type = 'api')",
    rows: apiFields,
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ipnSections = [
  {
    slug: "introduction",
    title: "Introduction",
    body: [
      "The IPN system will notify your server when you receive a payment and when a payment status changes. This is a easy and useful way to integrate our payments into your software to automate order completion, digital downloads, accounting, or whatever you can think up. It is implemented by making a HTTP POST call over a https:// or http:// URL to a script or CGI program on your server.",
    ],
  },
  {
    slug: "ipn-setup",
    title: "IPN Setup",
    body: [
      "The first step is to go to the My Settings page and set a IPN Secret. Your IPN Secret is a string of your choosing that is used to verify that an IPN was really sent from our servers (recommended to be a random string of letters, numbers, and special characters). Our system will not send any IPNs unless you have an IPN Secret set. See the Authenticating IPNs section for more details.",
      "At the same time you can optionally set an IPN URL; this is the URL that will be called when sending you IPN notifications. You can also set an IPN URL in your Buy Now and Cart buttons that will be used instead of this one.",
    ],
  },
  {
    slug: "ipn-retries",
    title: "IPN Retries",
    body: [
      "If there is an error sending your server an IPN, we will retry up to 10 times. Because of this you are not guaranteed to receive every IPN (if all 10 tries fail) or that your server will receive them in order. Your IPN handler must always check to see if a payment has already been handled before to avoid double-crediting users, etc. in the case of duplicate IPNs.",
    ],
  },
  {
    slug: "authenticating-ipns",
    title: "Authenticating IPNs",
    method: "POST",
    body: [
      "We use your IPN Secret as the HMAC shared secret key to generate an HMAC signature of the raw POST data. The HMAC signature is sent as a HTTP header called HMAC.",
      "Here is what it would look like in PHP:",
    ],
    codeTitle: "PHP HMAC verification",
    code: phpHmacExample,
  },
  {
    slug: "payment-statuses",
    title: "Payment Statuses",
    body: [
      "Payments will post with a status field, here are the currently defined values:",
    ],
    tables: [
      { label: "Currently defined values", rows: statusRows },
      { label: "Future-proofing rules", rows: futureProofRows },
    ],
  },
  {
    slug: "code-samples",
    title: "Code Samples",
    body: [
      "Use this PHP example to verify the HMAC header before processing IPN payload fields.",
    ],
    codeTitle: "PHP HMAC verification",
    code: phpHmacExample,
  },
  {
    slug: "ipn-post-fields",
    title: "IPN POST Fields",
    body: [
      "Field Name, Description, and Required values for IPN POST payloads.",
    ],
    tables: ipnTables,
  },
];

function SectionContent({ section }) {
  return (
    <section className="rounded-[20px] border border-input-border/80 bg-card-bg p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="border-b border-input-border/70 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {section.method ? <MethodBadge method={section.method} /> : null}
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">
            {section.title}
          </h2>
        </div>
      </div>
      <div className="space-y-7 pt-6">
        {section.body?.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-6 text-secondary-text">
            {paragraph}
          </p>
        ))}
        {section.tables?.map((table) => (
          <ParameterTable
            key={table.label || table.title}
            compact
            rows={table.rows}
            label={table.label || table.title}
            description={table.description}
          />
        ))}
      </div>
    </section>
  );
}

function RightPanel({ section }) {
  if (section.code) {
    return (
      <section className="relative h-full overflow-hidden rounded-[20px] border border-input-border/80 bg-card-bg shadow-[var(--shadow-soft)]">
        <div className="pointer-events-none absolute -right-16 top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-input-border/70 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-theme-text">
            <Braces size={16} className="text-primary" />
            Code sample
          </p>
        </div>
        <div className="relative p-4">
          <CodeBlock
            title={section.codeTitle}
            value={section.code}
            copyLabel="Copy PHP"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-full overflow-hidden rounded-[20px] border border-input-border/80 bg-card-bg shadow-[var(--shadow-soft)]">
      <div className="pointer-events-none absolute -right-16 top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex items-center gap-2 border-b border-input-border/70 px-5 py-4 text-sm font-semibold text-theme-text">
        <ShieldCheck size={16} className="text-primary" />
        IPN checklist
      </div>
      <div className="relative space-y-3 p-4 text-sm leading-6 text-secondary-text">
        <p className="rounded-xl border border-input-border bg-primary/5 p-3">
          Set an IPN Secret before expecting notifications.
        </p>
        <p className="rounded-xl border border-input-border bg-primary/5 p-3">
          Verify the HMAC header before processing any payload.
        </p>
        <p className="rounded-xl border border-input-border bg-primary/5 p-3">
          Check the merchant ID and payment status.
        </p>
        <p className="rounded-xl border border-input-border bg-primary/5 p-3">
          Handle duplicate IPNs and out-of-order retries.
        </p>
        <p className="rounded-xl border border-input-border bg-primary/5 p-3">
          Release products only when payment status is &gt;= 100.
        </p>
      </div>
    </section>
  );
}

export default function InstantPaymentNotificationPage() {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(ipnSections[0].slug);
  const activeSection = useMemo(
    () =>
      ipnSections.find((section) => section.slug === activeSlug) ||
      ipnSections[0],
    [activeSlug],
  );

  return (
    <div className="space-y-4 pb-10 xl:flex xl:h-[calc(100dvh-6.5rem)] xl:flex-col xl:overflow-hidden xl:pb-0">
      <header className="relative overflow-visible rounded-[20px] border border-input-border/80 bg-card-bg px-5 py-6 shadow-[var(--shadow-soft)] sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/12 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-start gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-600/70 bg-[#13111A] text-white shadow-[0_0_20px_rgba(5, 0, 255,0.15)] transition-all duration-200 hover:border-violet-500 hover:bg-violet-500/10 hover:shadow-[0_0_25px_rgba(5, 0, 255,0.35)] active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft size={22} strokeWidth={2.2} />
            </button>
            <div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <BellRing size={23} />
              </span>
              <div>
                <p className="mb-1 text-sm font-semibold text-primary">
                  Developer resources
                </p>
                <h1 className="text-[1.7rem] font-semibold text-theme-text sm:text-[1.95rem]">
                  Instant Payment Notifications (IPN)
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-secondary-text sm:text-[.95rem]">
                  Configure server notifications for payment events, status
                  changes, and merchant callback handling.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-input-border bg-primary/5 px-4 py-3 text-sm font-semibold text-theme-text">
            Testing Note: The system will only let you have 3 transactions at a
            time in the &apos;Waiting for funds...&apos; state.
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[18rem_minmax(0,1fr)_22rem] xl:items-stretch xl:overflow-hidden">
        <aside className="flex h-full flex-col rounded-[20px] border border-input-border/80 bg-card-bg p-3 shadow-[var(--shadow-soft)] xl:sticky xl:top-0 xl:min-h-0 xl:overflow-y-auto">
          <div className="mb-3 flex items-start gap-3 px-2 pt-2">
            <CircleHelp size={23} className="mt-0.5 text-primary" />
            <div>
              <h2 className="font-semibold text-theme-text">IPN Guide</h2>
              <p className="mt-1 text-xs leading-5 text-secondary-text">
                Choose a section to view its integration details.
              </p>
            </div>
          </div>
          <nav aria-label="IPN documentation sections" className="space-y-1">
            {ipnSections.map((section) => {
              const active = section.slug === activeSection.slug;
              return (
                <button
                  key={section.slug}
                  type="button"
                  onClick={() => setActiveSlug(section.slug)}
                  className={`relative flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary/14 font-semibold text-theme-text" : "text-secondary-text hover:bg-primary/7 hover:text-theme-text"}`}
                >
                  <span
                    className={`absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary ${active ? "scale-y-100" : "scale-y-0"}`}
                  />
                  {section.title}
                  {section.method ? (
                    <MethodBadge method={section.method} />
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto hidden rounded-xl border border-input-border bg-primary/5 p-4 lg:block">
            <div className="flex gap-3">
              <LifeBuoy size={20} className="shrink-0 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-theme-text">
                  Need help?
                </h3>
                <p className="mt-1 text-xs leading-5 text-secondary-text">
                  Our support team is here to help.
                </p>
                <a
                  className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                  href="/User/help"
                >
                  Contact support -&gt;
                </a>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 xl:h-full xl:overflow-y-auto xl:pr-1">
          <SectionContent section={activeSection} />
        </main>

        <aside className="min-w-0 xl:sticky xl:top-0 xl:h-full">
          <RightPanel section={activeSection} />
        </aside>
      </div>
    </div>
  );
}

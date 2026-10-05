"use client";

import { Button, Dropdown, Input } from "@/components/ReusableUi";
import {
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Hourglass,
  KeyRound,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const steps = {
  business: {
    title: "Business Information",
    number: "01",
    next: "/merchants/onboard/owner-details",
  },
  owner: {
    title: "Owner Details",
    number: "02",
    next: "/merchants/onboard/settlement-details",
  },
  settlement: {
    title: "Settlement Details",
    number: "03",
    next: "/merchants/onboard/api-configuration",
  },
  api: {
    title: "API Configuration",
    number: "04",
    next: "/merchants/onboard/kyc-documentation",
  },
  kyc: {
    title: "KYC Documentation",
    number: "05",
    next: "/merchants/onboard/processing",
  },
};

const businessTypes = [
  { label: "Retail & Apparel", value: "retail" },
  { label: "Food & Grocery", value: "food" },
  { label: "Travel & Hospitality", value: "travel" },
  { label: "Health & Wellness", value: "health" },
];

const states = [
  { label: "Kerala", value: "kerala" },
  { label: "Karnataka", value: "karnataka" },
  { label: "Tamil Nadu", value: "tamil-nadu" },
  { label: "Maharashtra", value: "maharashtra" },
];

const designations = [
  { label: "Founder", value: "founder" },
  { label: "Director", value: "director" },
  { label: "Partner", value: "partner" },
  { label: "Authorized Signatory", value: "authorized-signatory" },
];

const banks = [
  { label: "HDFC Bank", value: "hdfc" },
  { label: "ICICI Bank", value: "icici" },
  { label: "Axis Bank", value: "axis" },
  { label: "State Bank of India", value: "sbi" },
];

const accountTypes = [
  { label: "Current Account", value: "current" },
  { label: "Savings Account", value: "savings" },
  { label: "Nodal Account", value: "nodal" },
];

function CopyValueButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  function handleCopy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
  }

  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onClick={handleCopy}
      className="text-text-primary transition hover:text-text-primary"
    >
      {copied ? (
        <Check className="h-4 w-4 text-text-primary" />
      ) : (
        <Copy className="h-4 w-4 text-text-primary" />
      )}
    </button>
  );
}

function StepHeader({ step }) {
  return (
    <div className="flex items-center gap-5">
      <h1 className="text-large font-semibold text-theme-text">{step.title}</h1>
      <span className="grid h-8 w-8 place-items-center rounded-full [background:var(--button-primary)] text-small font-semibold text-white">
        {step.number}
      </span>
    </div>
  );
}

function FormCard({ title, children, footer }) {
  return (
    <section className="rounded-rounded border border-input-border bg-card-bg p-5 sm:p-7">
      <div className="space-y-8">
        <h2 className="text-large font-semibold text-theme-text">{title}</h2>
        {children}
        {footer && <div className="flex justify-end pt-2">{footer}</div>}
      </div>
    </section>
  );
}

function ContinueButton({ onClick, label = "Save & Continue" }) {
  return (
    <Button variant="primary" afterIcon={<ArrowRight className="h-4 w-4" />} onClick={onClick}>
      {label}
    </Button>
  );
}

function FieldGrid({ children }) {
  return <div className="grid gap-6 md:grid-cols-2">{children}</div>;
}

function RadioOption({ label, checked }) {
  return (
    <label className="inline-flex items-center gap-3 text-mid text-text-secondary">
      <span
        className={
          checked
            ? "grid h-5 w-5 place-items-center rounded-full border border-text-primary bg-text-primary/15"
            : "grid h-5 w-5 place-items-center rounded-full border border-input-border bg-input-bg"
        }
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-text-primary" />}
      </span>
      {label}
    </label>
  );
}

function CheckOption({ label, checked }) {
  return (
    <label className="inline-flex items-center gap-3 text-mid text-text-secondary">
      <span
        className={
          checked
            ? "grid h-5 w-5 place-items-center rounded-full border border-text-primary bg-text-primary/15"
            : "grid h-5 w-5 place-items-center rounded-full border border-input-border bg-input-bg"
        }
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-text-primary" />}
      </span>
      {label}
    </label>
  );
}

function UploadCard({ title, description }) {
  return (
    <button
      type="button"
      className="flex min-h-36 flex-col items-center justify-center rounded-rounded border border-text-primary/20 bg-text-primary/5 px-5 py-4 text-center transition hover:border-text-primary/50 hover:bg-text-primary/10"
    >
      <span className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-text-primary/25 bg-text-primary/10 text-text-primary">
        <Upload className="h-5 w-5" />
      </span>
      <span className="text-mid font-semibold text-theme-text">{title}</span>
      <span className="mt-1 text-small text-text-secondary">{description}</span>
    </button>
  );
}

function BusinessInformation() {
  const router = useRouter();

  return (
    <FormCard
      title="Business Information"
      footer={<ContinueButton onClick={() => router.push(steps.business.next)} />}
    >
      <div className="space-y-10">
        <FieldGrid>
          <Input label="Business Name" placeholder="Enter business name" />
          <Dropdown label="Business Type" placeholder="Select business type" options={businessTypes} />
          <Input label="Website URL (Optional)" placeholder="https://example.com" />
          <Input label="Business Email" type="email" placeholder="Enter business email" />
          <Input label="Phone Number" placeholder="Enter phone number" className="md:col-span-2" />
        </FieldGrid>

        <div className="space-y-6">
          <h2 className="text-large font-semibold text-theme-text">Business Address</h2>
          <FieldGrid>
            <Input label="Address Line 1" placeholder="Enter address line 1" />
            <Input label="Address Line 2 (Optional)" placeholder="Enter address line 2" />
            <Input label="City" placeholder="Enter city" />
            <Dropdown label="State" placeholder="Select state" options={states} />
            <Input label="PIN Code" placeholder="Enter PIN code" className="md:col-span-2" />
          </FieldGrid>
        </div>
      </div>
    </FormCard>
  );
}

function OwnerDetails() {
  const router = useRouter();

  return (
    <FormCard
      title="Owner Details"
      footer={<ContinueButton onClick={() => router.push(steps.owner.next)} />}
    >
      <FieldGrid>
        <Input label="Owner Name" placeholder="Enter owner full name" />
        <Input label="Owner Email" type="email" placeholder="Enter owner email" />
        <Input label="Owner Phone Number" placeholder="Enter phone number" />
        <Dropdown label="Designation" placeholder="Select designation" options={designations} />
        <Input label="Date of Birth" type="date" placeholder="Select date" afterIcon={<Calendar className="h-4 w-4" />} />
        <Input label="PAN Number" placeholder="Enter PAN number" />
      </FieldGrid>
    </FormCard>
  );
}

function SettlementDetails() {
  const router = useRouter();

  return (
    <FormCard
      title="Settlement Details"
      footer={<ContinueButton onClick={() => router.push(steps.settlement.next)} />}
    >
      <FieldGrid>
        <Input label="Account Holder Name" placeholder="Enter account holder name" />
        <Dropdown label="Bank Name" placeholder="Select bank name" options={banks} />
        <Input label="Account Number" placeholder="Enter account number" />
        <Input label="Confirm Account Number" placeholder="Confirm account number" />
        <Input label="IFSC Code" placeholder="Enter IFSC code" />
        <Dropdown label="Account Type" placeholder="Select account type" options={accountTypes} />
      </FieldGrid>
    </FormCard>
  );
}

function ApiConfiguration() {
  const router = useRouter();
  const apiKey = "sk_test_eco_banx_demo";

  return (
    <FormCard
      title="API & Configuration"
      footer={<ContinueButton onClick={() => router.push(steps.api.next)} />}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <Input
          label="Merchant ID"
          value="MCH_20260001"
          readOnly
          afterIcon={<Sparkles className="h-4 w-4 text-text-primary" />}
        />
        <Input
          label="API Key"
          type="password"
          value={apiKey}
          readOnly
          beforeIcon={<KeyRound className="h-4 w-4" />}
          afterIcon={<CopyValueButton value={apiKey} label="API key" />}
        />
        <Input
          label="IP Whitelist (Optional)"
          placeholder="Add IP address and press Enter"
        />
        <Input
          label="Webhook URL (Optional)"
          placeholder="https://yourdomain.com/webhook"
        />
        <div className="space-y-4">
          <p className="text-mid font-medium text-text-secondary">
            Environment
          </p>
          <div className="flex flex-wrap gap-6">
            <RadioOption label="Sandbox" checked />
            <RadioOption label="Live" />
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-mid font-medium text-text-secondary">API Access</p>
          <div className="flex flex-wrap gap-5">
            <CheckOption label="Payments" checked />
            <CheckOption label="Settlements" />
            <CheckOption label="Payouts" />
            <CheckOption label="Refunds" />
            <CheckOption label="Webhooks" />
          </div>
        </div>
      </div>
    </FormCard>
  );
}

function KycDocumentation() {
  const router = useRouter();

  return (
    <FormCard title="KYC Documentation">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <UploadCard title="PAN Card / Tax ID" description="Upload PAN card" />
        <UploadCard title="GST Number (Optional)" description="Upload GST certificate" />
        <UploadCard title="Business Registration" description="Registration certificate" />
        <UploadCard title="Bank Account Proof" description="Upload bank account proof" />
        <UploadCard title="Address Proof" description="Upload address proof" />
      </div>
      <div className="flex justify-end">
        <ContinueButton label="Onboard Merchant" onClick={() => router.push(steps.kyc.next)} />
      </div>
    </FormCard>
  );
}

function ProcessingScreen() {
  return (
    <section className="relative grid min-h-[calc(100vh-148px)] place-items-center overflow-hidden rounded-rounded">
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="absolute inset-x-8 top-16 h-32 rounded-full bg-text-primary/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-[420px] w-full max-w-xl flex-col items-center justify-center rounded-[96px] border border-input-border/30 bg-text-primary/10 p-8 text-center shadow-2xl shadow-black/40">
        <div className="relative mb-8 grid h-36 w-36 place-items-center rounded-full bg-text-primary/10 text-text-primary [animation:soft-lift_3s_ease-in-out_infinite]">
          <Hourglass className="h-24 w-24" strokeWidth={1.4} />
          <span className="absolute inset-5 rounded-full border border-text-primary/20" />
        </div>
        <h1 className="text-3xl font-semibold text-theme-text">Onboard Merchant Processing</h1>
        <p className="mt-5 max-w-md text-large leading-7 text-text-secondary">
          After onboarding, the merchant will be reviewed by our team. You will be notified via email once the merchant is activated.
        </p>
      </div>
    </section>
  );
}

export default function MerchantOnboarding({ step }) {
  if (step === "processing") {
    return <ProcessingScreen />;
  }

  const currentStep = steps[step];

  return (
    <div className="space-y-6">
      <StepHeader step={currentStep} />
      {step === "business" && <BusinessInformation />}
      {step === "owner" && <OwnerDetails />}
      {step === "settlement" && <SettlementDetails />}
      {step === "api" && <ApiConfiguration />}
      {step === "kyc" && <KycDocumentation />}
    </div>
  );
}

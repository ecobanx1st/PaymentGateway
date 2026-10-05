"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeInfo,
  Bookmark,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Button from "@/components/ui/button";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";
import { MERCHANT_BUTTON_ROUTES } from "@/lib/merchant-button-config";

const tutorialSteps = [
  {
    title: "Open Checkout",
    icon: CreditCard,
    description:
      "Open your saved checkout page and enter the customer's total then click Next.",
  },
  {
    title: "Choose Coin",
    icon: CircleDollarSign,
    description:
      "If you are accepting more than Bitcoin ask the customer which coin they would like to pay with and select it for them, then click Next.",
  },
  {
    title: "Show QR Code",
    icon: QrCode,
    description:
      "The status page will have a QR code on it, display this to the buyer so they can scan it with their phone to pay the balance.",
  },
  {
    title: "Confirm Status",
    icon: ShieldCheck,
    description:
      "Watch the status page until it indicates they have sent funds, depending on the amount of the order you may want to wait for the payment to be Complete in case of any issues.",
  },
];

const quickTips = [
  "Bookmark the POS checkout page.",
  "Use a stable internet connection.",
  "Verify the payment amount before confirming.",
  "Wait for payment confirmation instead of relying only on customer screenshots.",
];

function TutorialInfoCard() {
  return (
    <section className="rounded-[20px] border border-input-border/70 bg-primary-bg p-5 shadow-[0_16px_40px_rgba(8,19,12,0.06)] sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
          <BadgeInfo size={20} aria-hidden="true" />
        </span>
        <h2 className="text-xl font-bold tracking-tight text-theme-text">
          Point of Sale (POS) Interface
        </h2>
      </div>
      <p className="text-sm leading-7 text-secondary-text sm:text-[15px]">
        <span className="font-semibold text-primary-text">The POS interface</span>{" "}
        is designed to be a simple way to accept in-person payments. Here is
        the preferred way to use the interface:
      </p>
      <p className="mt-3 text-sm leading-7 text-secondary-text sm:text-[15px]">
        Start by bookmarking your{" "}
        <span className="font-semibold text-primary-text">POS checkout URL</span>{" "}
        on your phone/tablet. [If you log in to your account and return to this
        page we will have your checkout URL here for you.]
      </p>
    </section>
  );
}

function TutorialStepCard({ step, index }) {
  const Icon = step.icon;

  return (
    <article className="relative rounded-[20px] border border-input-border/70 bg-primary-bg p-5 shadow-[0_16px_40px_rgba(8,19,12,0.05)] transition hover:border-primary/35 hover:shadow-[0_18px_48px_rgba(75, 71, 255,0.1)] sm:p-6">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-[0_10px_24px_rgba(75, 71, 255,0.24)]">
            {index + 1}
          </span>
          {index < tutorialSteps.length - 1 ? (
            <span className="mt-3 hidden h-full min-h-10 w-px bg-input-border sm:block" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary-text">
                Step {index + 1}
              </p>
              <h3 className="text-base font-bold text-theme-text sm:text-lg">
                {step.title}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-secondary-text sm:text-[15px]">
            {step.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function TutorialSteps() {
  return (
    <section className="space-y-4" aria-labelledby="pos-steps-title">
      <div className="space-y-2">
        <h2 id="pos-steps-title" className="text-2xl font-bold tracking-tight text-theme-text">
          When a customer wants to pay, simply:
        </h2>
      </div>
      <div className="grid gap-4">
        {tutorialSteps.map((step, index) => (
          <TutorialStepCard key={step.title} step={step} index={index} />
        ))}
      </div>
    </section>
  );
}

function TutorialWarningCard() {
  return (
    <section className="rounded-[20px] border border-warning/25 bg-warning/10 p-5 text-theme-text shadow-[0_16px_40px_rgba(245,158,11,0.08)] sm:p-6" aria-labelledby="pos-warning-title">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-warning/25 bg-warning/15 text-warning">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="pos-warning-title" className="text-lg font-bold text-theme-text">
            Important
          </h2>
          <p className="mt-2 text-sm leading-7 text-secondary-text sm:text-[15px]">
            If you do choose to accept payment without confirms make sure the
            amount they sent matches the total expected!!!
          </p>
        </div>
      </div>
    </section>
  );
}

function TutorialTipsCard() {
  return (
    <section className="rounded-[20px] border border-input-border/70 bg-primary-bg p-5 shadow-[0_16px_40px_rgba(8,19,12,0.05)] sm:p-6" aria-labelledby="pos-tips-title">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
          <Bookmark size={20} aria-hidden="true" />
        </span>
        <h2 id="pos-tips-title" className="text-xl font-bold tracking-tight text-theme-text">
          Quick Tips
        </h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {quickTips.map((tip) => (
          <li key={tip} className="flex items-start gap-3 text-sm leading-6 text-secondary-text">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TutorialActions() {
  return (
    <section className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <Button
        value="Back to Merchant Tools"
        onNavigate={MERCHANT_BUTTON_ROUTES.tools}
        icon={<ArrowLeft size={16} />}
        className="w-full px-5 text-theme-text sm:w-auto"
      />
      <Button
        value="Open POS"
        variant="primary"
        onNavigate={MERCHANT_BUTTON_ROUTES.posQrGenerator}
        rightIcon={<ArrowRight size={16} />}
        className="w-full border-0 px-5 text-white sm:w-auto"
      />
    </section>
  );
}

export default function POSTutorial() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <MerchantToolPageHeader
        title="POS How-to Tutorial"
        description="Learn how to accept in-person payments using the POS interface in just a few simple steps."
        icon={Smartphone}
      />
      <TutorialInfoCard />
      <TutorialSteps />
      <TutorialWarningCard />
      <TutorialTipsCard />
      <TutorialActions />
    </div>
  );
}
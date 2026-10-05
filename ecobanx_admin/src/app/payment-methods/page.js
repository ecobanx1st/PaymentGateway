import {
  BadgeIndianRupee,
  Bitcoin,
  CreditCard,
  Landmark,
  ScanLine,
  WalletCards,
} from "lucide-react";

const paymentMethods = [
  {
    name: "UPI",
    volume: "52,400 txns",
    successRate: "98.2%",
    icon: ScanLine,
  },
  {
    name: "Credit card",
    volume: "28,120 txns",
    successRate: "95.6%",
    icon: CreditCard,
  },
  {
    name: "Debit card",
    volume: "19,860 txns",
    successRate: "96.1%",
    icon: CreditCard,
  },
  {
    name: "Net banking",
    volume: "12,940 txns",
    successRate: "94.3%",
    icon: Landmark,
  },
  {
    name: "Wallet",
    volume: "28,120 txns",
    successRate: "95.6%",
    icon: WalletCards,
  },
  {
    name: "Crypto (beta)",
    volume: "410 txns",
    successRate: "88.0%",
    icon: Bitcoin,
  },
];

function PaymentMethodCard({ method }) {
  const Icon = method.icon;
  const IconAccent = method.name === "UPI" ? BadgeIndianRupee : Icon;

  return (
    <article className="group flex min-h-[220px] flex-col justify-between rounded-rounded border border-input-border/50 p-7 transition duration-300 [background:radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.16),transparent_42%),var(--card-bg)] hover:-translate-y-1 hover:border-text-primary/70 hover:shadow-[0_18px_55px_rgba(124,58,237,0.12)] sm:min-h-[240px]">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-text-primary/20 bg-text-primary/10 text-text-primary transition group-hover:border-text-primary/40 group-hover:bg-text-primary/15">
          <IconAccent className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-theme-text">
          {method.name}
        </h2>
      </div>

      <div className="mt-8 flex items-end justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[clamp(1.25rem,2vw,1.65rem)] font-extrabold text-theme-text">
            {method.volume}
          </p>
          <p className="mt-2 text-small text-text-secondary">Volume (30d)</p>
        </div>
        <div className="text-right">
          <p className="text-[clamp(1.25rem,2vw,1.65rem)] font-extrabold text-theme-text">
            {method.successRate}
          </p>
          <p className="mt-2 text-small text-text-secondary">Success rate</p>
        </div>
      </div>
    </article>
  );
}

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-9">
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Payment Methods</h1>
        <p className="text-small text-text-secondary">
          Enable, Disable, And Monitor Accepted Payment Rails
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        {paymentMethods.map((method) => (
          <PaymentMethodCard key={method.name} method={method} />
        ))}
      </section>
    </div>
  );
}

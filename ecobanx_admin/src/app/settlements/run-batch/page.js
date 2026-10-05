"use client";

import { Button, Dropdown, Input } from "@/components/ReusableUi";
import { useRouter } from "next/navigation";

const merchantOptions = [
  { label: "All Eligible Merchants", value: "all" },
  { label: "Kaveri Textiles", value: "kaveri-textiles" },
  { label: "Nilgiri Foods", value: "nilgiri-foods" },
  { label: "Coral Electronics", value: "coral-electronics" },
];

const payoutMethods = [
  { label: "NEFT / IMPS", value: "neft-imps" },
  { label: "RTGS", value: "rtgs" },
  { label: "UPI Payout", value: "upi" },
];

const cutOffTimes = [
  { label: "11:00 PM", value: "23:00" },
  { label: "06:00 PM", value: "18:00" },
  { label: "03:00 PM", value: "15:00" },
];

export default function RunSettlementBatchPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-theme-text">Run Settlement Batch</h1>
        <p className="text-large text-text-secondary">
          Create A New Settlement Batch To Process Payouts To Merchant Accounts.
        </p>
      </section>

      <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-7">
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-theme-text">Run Settlement Batch</h2>

          <div className="grid gap-7 lg:grid-cols-2">
            <Input
              label="Settlement Date"
              type="text"
              placeholder="Jul 16, 2026"
              defaultValue="Jul 16, 2026"
            />
            <Dropdown
              label="Select Merchants"
              defaultValue="all"
              options={merchantOptions}
            />
            <Dropdown
              label="Payout Method"
              defaultValue="neft-imps"
              options={payoutMethods}
            />
            <Dropdown
              label="Cut-off Time"
              defaultValue="23:00"
              options={cutOffTimes}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-auto sm:min-w-32"
              onClick={() => router.push("/settlements")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="w-full sm:w-auto sm:min-w-36"
              toastContent="Settlement batch started successfully"
            >
              Run Batch
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}



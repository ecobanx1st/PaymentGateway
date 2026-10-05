"use client";

import MerchantExamplesLayout from "@/components/ui/MerchantExamplesLayout";
import { donationButtonConfig } from "@/lib/merchant-button-config";

const config = {
  ...donationButtonConfig,
  examplesTitle: "Donation HTML POST Fields",
  examplesDescription: "Field names, required status, formats, and sample values accepted by the Donation Button Maker HTML POST form.",
};

export default function Page() {
  return <MerchantExamplesLayout config={config} />;
}
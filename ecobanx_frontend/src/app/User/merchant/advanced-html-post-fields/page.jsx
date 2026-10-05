"use client";

import MerchantExamplesLayout from "@/components/ui/MerchantExamplesLayout";
import { advancedButtonConfig } from "@/lib/merchant-button-config";

const config = {
  ...advancedButtonConfig,
  examplesTitle: "Advanced HTML POST Fields",
  examplesDescription: "Field names, required status, formats, and sample values accepted by the Advanced Button Maker HTML POST form.",
};

export default function Page() {
  return <MerchantExamplesLayout config={config} />;
}
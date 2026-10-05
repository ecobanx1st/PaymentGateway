"use client";

import MerchantExamplesLayout from "@/components/ui/MerchantExamplesLayout";
import { simpleButtonConfig } from "@/lib/merchant-button-config";

const config = {
  ...simpleButtonConfig,
  examplesTitle: "Simple HTML POST Fields",
  examplesDescription: "Field names, required status, formats, and sample values accepted by the Simple Button Maker HTML POST form.",
};

export default function Page() {
  return <MerchantExamplesLayout config={config} />;
}
"use client";

import MerchantButtonMaker from "@/components/ui/MerchantButtonMaker";
import { simpleButtonConfig } from "@/lib/merchant-button-config";

export default function Page() {
  return <MerchantButtonMaker config={simpleButtonConfig} />;
}

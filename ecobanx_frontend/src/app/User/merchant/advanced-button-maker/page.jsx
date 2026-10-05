"use client";

import MerchantButtonMaker from "@/components/ui/MerchantButtonMaker";
import { advancedButtonConfig } from "@/lib/merchant-button-config";

export default function Page() {
  return <MerchantButtonMaker config={advancedButtonConfig} />;
}

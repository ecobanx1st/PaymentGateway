"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import ButtonCheckout from "@/app/checkout/button/ButtonCheckout";

function CheckoutDetailClient() {
  const params = useParams();
  const raw = params?.transactionId;
  const txn = Array.isArray(raw) ? raw[0] : String(raw || "");

  return <ButtonCheckout txnOverride={txn} />;
}

function CheckoutDetailFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
      Loading checkout...
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CheckoutDetailFallback />}>
      <CheckoutDetailClient />
    </Suspense>
  );
}

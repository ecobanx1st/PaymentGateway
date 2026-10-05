"use client";

import { Suspense } from "react";
import PaymentCheckout from "./PaymentCheckout";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
          Loading invoice checkout...
        </main>
      }
    >
      <PaymentCheckout />
    </Suspense>
  );
}

import { Suspense } from "react";
import ButtonCheckout from "./ButtonCheckout";

export const metadata = {
  title: "Button checkout",
  description: "Complete your Eco Banx button payment securely.",
};

function CheckoutFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 text-white">
      Loading checkout...
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <ButtonCheckout />
    </Suspense>
  );
}

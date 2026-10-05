import { Suspense } from "react";
import PaymentProcessing from "./PaymentProcessing";

export const metadata = { title: "Complete payment" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentProcessing />
    </Suspense>
  );
}

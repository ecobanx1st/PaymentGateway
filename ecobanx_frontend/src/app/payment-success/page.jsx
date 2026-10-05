import { Suspense } from "react";
import PaymentSuccess from "./PaymentSuccess";

export const metadata = { title: "Payment successful" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  );
}

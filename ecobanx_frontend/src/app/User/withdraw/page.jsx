"use client";

import { useEffect, useState } from "react";
import RoutePlaceholder from "@/components/route-placeholder";
import Skeleton from "@/components/ui/skeleton";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton pageName="wallet" />;
  }

  return (
    <RoutePlaceholder
      eyebrow="Wallet"
      title="Withdraw"
      description="Withdrawal requests, bank details, and payout limits can be managed here."
    />
  );
}

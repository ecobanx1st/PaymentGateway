"use client";

import { useEffect, useState } from "react";
import SimpleButtonMakerPage from "../merchant/simple-button-maker/page";
import Skeleton from "@/components/ui/skeleton";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton pageName="merchant" />;
  }

  return <SimpleButtonMakerPage />;
}

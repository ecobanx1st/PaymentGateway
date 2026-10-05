"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import brandLogo from "@/components/assets/darklogo.png";

export function PaymentStatusShell({ children, compact = false, logoOutside = false, footer = null }) {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-y-auto bg-[#08080a] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />
      <motion.div animate={{ x: [0, 24, 0], y: [0, 18, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/30 blur-[120px]" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, -18, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-blue-700/20 blur-[140px]" />
      
      {logoOutside && (
        <div className="mb-6 flex justify-center z-10">
          <Image src={brandLogo} alt="Eco Banx" priority className="h-auto w-32 sm:w-36" />
        </div>
      )}

      <motion.section initial={{ opacity: 0, y: 20, scale: 0.975 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className={`relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#111014]/85 shadow-[0_28px_100px_rgba(0,0,0,0.62),0_0_80px_rgba(5, 0, 255,0.13)] backdrop-blur-2xl ${compact ? "max-w-2xl p-5 sm:p-8" : "max-w-5xl p-5 sm:p-8"}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(75, 71, 255,0.16),transparent_35%)]" />
        <div className="relative">
          {!logoOutside && (
            <div className="mb-8 flex justify-center sm:mb-10"><Image src={brandLogo} alt="Eco Banx" priority className="h-auto w-32 sm:w-36" /></div>
          )}
          {children}
        </div>
      </motion.section>
      
      {footer}
    </main>
  );
}

export function ActionButton({ children, onClick, variant = "primary" }) {
  const base = "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
  const variants = {
    primary: "bg-[#0500FF] text-white shadow-[0_14px_32px_rgba(5,0,255,0.35)] hover:bg-[#0400CC] hover:shadow-[0_18px_42px_rgba(5,0,255,0.52)]",
    secondary: "border border-white/12 bg-white/[0.055] text-white/80 hover:border-primary/55 hover:bg-primary/10",
  };
  return <button type="button" onClick={onClick} className={`${base} ${variants[variant]}`}>{children}</button>;
}

export function DetailRow({ label, value }) {
  return <div className="flex items-center justify-between gap-4 border-b border-white/8 py-3.5 last:border-b-0"><span className="text-xs text-white/48">{label}</span><span className="max-w-[62%] truncate text-right text-sm font-medium text-white">{value}</span></div>;
}

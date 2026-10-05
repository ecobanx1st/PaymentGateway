import AdminShell from "@/components/layout/AdminShell";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const logoPath = `${basePath}/logowhitebg.png`;

export const metadata = {
  title: "Eco Banx Admin",
  description: "Admin panel for Eco Banx payment gateway operations.",
  icons: {
    icon: logoPath,
    shortcut: logoPath,
    apple: logoPath,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-bg-primary">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}

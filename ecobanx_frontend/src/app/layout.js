import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import PageTransition from "@/components/PageTransition";
import SmoothScroll from "@/components/SmoothScroll";
import brandLogo from "@/components/assets/darklogo.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Eco Banx | Secure Payment Gateway";
const siteDescription =
  "Accept online payments, create invoices, generate POS payment links, manage wallets, and track transactions from the Eco Banx dashboard.";

export const metadata = {
  title: {
    default: siteTitle,
    template: "%s | Eco Banx",
  },
  description: siteDescription,

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://payment.hashcodexperts.com/",
    images: [
      {
        url: brandLogo.src,
        width: 496,
        height: 105,
        alt: "Eco Banx",
      },
    ],
    siteName: "Eco Banx",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}

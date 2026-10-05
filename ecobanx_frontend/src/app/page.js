"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import darklogo from "@/components/assets/darklogo.png";
import {
  Moon,
  Sun,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Activity,
  TrendingUp,
  Globe,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Layers,
  Shield,
  BarChart3,
  Coins,
  Cpu,
  LayoutDashboard,
  Check,
  Smartphone,
  ShieldAlert,
  Server,
  Database,
  User,
  Wallet,
  Mail,
  Send,
  Plus,
  Minus,
  BoxIcon,
  PlusCircle,
  Asterisk,
  PhoneIcon,
  Lock,
  SquareActivity,
  HeartPulse,
  FileChartColumnIncreasingIcon,
  ChartBarIncreasingIcon,
  CreditCardIcon,
  Globe2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import SecurityShield from "@/components/assets/Landing/ecobanx-security-blue.png";
import Settlement from "@/components/assets/Landing/ecobanx-settlement-blue.png";
import Leader1 from "@/components/assets/Landing/Leader1.png";
import Leader2 from "@/components/assets/Landing/Leader2.png";
import Leader3 from "@/components/assets/Landing/leader3.png";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { AUTH_CHANGE_EVENT, clearAuthTokens, getStoredAccessToken } from "@/lib/auth";
import { clearStoredUserVerification } from "@/lib/user-verification-storage";
import Dropdown from "@/components/ui/dropdown";
import Snackbar from "@/components/ui/Snackbar";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Products", href: "#product" },
  { label: "Solutions", href: "#solution" },
];

const STATS = [
  { icon: Activity, value: "99.99%", label: "Platform Uptime SLA" },
  { icon: TrendingUp, value: "$48B+", label: "Processed Annually" },
  { icon: Globe, value: "180+", label: "Countries Reached" },
];

const FEATURES = [
  {
    icon: Globe2,
    title: "Global Acquiring",
    desc: "Route Every Card, Wallet And Bank Transfer Through Local Acquiring In 180+ Countries To Lift Authorization Rates.",
    link: "#global acquiring",
    linkLabel: "Explore acquiring",
  },
  {
    icon: Layers,
    title: "Smart Orchestration",
    desc: "Dynamic Routing Rules Pick The Cheapest, Fastest, Highest-Converting Path For Every Transaction Automatically.",
    link: "#smart orchestration",
    linkLabel: "Explore orchestration",
  },
  {
    icon: Shield,
    title: "Adaptive Fraud Defense",
    desc: "Machine-Learned Risk Scoring Evaluates Every Transaction In Under 40ms Without Adding Checkout Friction.",
    link: "#fraud defence",
    linkLabel: "Explore risk engine",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Revenue, Decline Reasons And Settlement Timing In One Live Dashboard — Sliced By Region, Method Or Merchant.",
    link: "#",
    linkLabel: "Explore analytics",
  },
  {
    icon: CreditCardIcon,
    title: "Automated Payouts",
    desc: "Split, Schedule And Reconcile Payouts To Merchants, Vendors And Marketplaces Across 41 Settlement Currencies.",
    link: "#payouts",
    linkLabel: "Explore payouts",
  },
  {
    icon: Cpu,
    title: "Developer-First APIs",
    desc: "REST And Webhook APIs, Sandbox Environments And SDKs In Six Languages — Ship An Integration In Days.",
    link: "#",
    linkLabel: "Explore the API",
  },
];
const SOLUTIONS = [
  {
    icon: Layers,
    title: "Marketplaces",
    desc: "Split payments between buyers, sellers and your platform automatically, with compliant KYC for every seller onboarded.",
  },
  {
    icon: Layers,
    title: "Subscriptions & billing",
    desc: "Recurring billing that recovers failed renewals automatically with smart retry timing tuned per issuer.",
  },
  {
    icon: Lock,
    title: "Retail & in-store",
    desc: "Unify e-commerce and point-of-sale under one ledger, so omnichannel reporting is never a manual export job.",
  },
  {
    icon: Cpu,
    title: "Software platforms",
    desc: "Embed payments into your own SaaS product with a white-labeled experience and revenue share built in.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare & regulated",
    desc: "Handle patient billing and insurance disbursement with the compliance posture regulated industries require.",
  },
  {
    icon: ChartBarIncreasingIcon,
    title: "Logistics & freight",
    desc: "Coordinate carrier payouts, fuel surcharges and cross-border settlement across a fragmented supplier network.",
  },
];

const LEADERS = [
  {
    name: "Rhea Kapoor",
    role: "VP Finance, Cobalt Retail",
    image: Leader1,
  },
  {
    name: "Aarav Sharma",
    role: "Head of Payments, NeoPay",
    image: Leader2,
  },
  {
    name: "Marcus Vance",
    role: "Director of Engineering, Zenith",
    image: Leader3,
  },
];

const FAQ_ITEMS = [
  {
    q: "How Long Does Onboarding Take?",
    a: "Most Starter And Growth Accounts Are Approved And Processing Live Transactions Within 1–2 Business Days. Enterprise Onboarding Typically Takes 2–4 Weeks Depending On Routing Complexity.",
  },
  {
    q: "What Happens If A Payout Fails?",
    a: "Failed Payouts Are Automatically Retried And Flagged In Your Dashboard With The Failure Reason. Our Support Team Is Notified For Enterprise Accounts On Any High-Value Failure.",
  },
  {
    q: "Can I Migrate From Another Payment Provider?",
    a: "Yes — Our Implementation Team Provides A Migration Playbook And Can Run Both Providers In Parallel During Transition To Avoid Any Processing Downtime.",
  },
  {
    q: "Where Can I Find My API Keys?",
    a: "API Keys Live Under Developer Settings In Your Dashboard. Sandbox Keys Are Available Immediately After Signup; Live Keys Unlock Once Your Account Is Verified.",
  },
  {
    q: "What Currencies Does Eco Banx Support?",
    a: "Eco Banx Supports 41 Settlement Currencies And Accepts Payments In 135+ Presentment Currencies, With Real-Time FX Conversion At Competitive Mid-Market Rates.",
  },
  {
    q: "Is Eco Banx PCI DSS Compliant?",
    a: "Yes. Eco Banx Is A PCI DSS Level 1 Certified Service Provider — The Highest Level Of Compliance. Your Integration Inherits This Certification, Reducing Your Own Compliance Scope Significantly.",
  },
];

const HERO_HEADLINE_LINES = [
  "Payment Infrastructure For The World's Ambitious Enterprises",
];

const ISLAND_TRANSITION = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 1.05,
};

const HEADER_REVEAL_VARIANTS = {
  closed: {
    opacity: 0,
    width: 0,
    marginLeft: -10,
    transition: {
      ...ISLAND_TRANSITION,
      opacity: { duration: 0.28, ease: "easeOut" },
      staggerChildren: 0.028,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    width: "auto",
    marginLeft: 0,
    transition: {
      ...ISLAND_TRANSITION,
      opacity: { duration: 0.34, ease: "easeOut" },
      delayChildren: 0.12,
      staggerChildren: 0.07,
    },
  },
};

const HEADER_TEXT_VARIANTS = {
  closed: {
    opacity: 0,
    y: 10,
    filter: "blur(8px)",
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.28, ease: "easeOut" },
  },
  open: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    clipPath: "inset(0 0 0% 0)",
    transition: { type: "spring", stiffness: 260, damping: 28, mass: 0.9 },
  },
};

const HERO_TITLE_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.22,
    },
  },
};

const HERO_LINE_VARIANTS = {
  hidden: { y: "115%", opacity: 0, filter: "blur(10px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 170, damping: 24, mass: 0.9 },
  },
};

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const themedLogo = darklogo;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [headerFocused, setHeaderFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeNav, setActiveNav] = useState("#home");
  const hoverDelayRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isIsland = scrolled && !headerHovered && !headerFocused;
  const headerRevealState = isIsland ? "closed" : "open";

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);

      const currentLink =
        NAV_LINKS.reduce((current, link) => {
          const target = document.querySelector(link.href);
          if (!target) return current;

          return target.getBoundingClientRect().top <= 140
            ? link.href
            : current;
        }, NAV_LINKS[0]?.href || "#home") || "#home";

      setActiveNav(currentLink);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuthentication = () => {
      setIsAuthenticated(Boolean(getStoredAccessToken()));
    };

    syncAuthentication();
    window.addEventListener("storage", syncAuthentication);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthentication);

    return () => {
      window.removeEventListener("storage", syncAuthentication);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthentication);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoverDelayRef.current) {
        clearTimeout(hoverDelayRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showComingSoon = () => {
    setToastMessage("Coming soon");

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
      toastTimerRef.current = null;
    }, 2200);
  };

  const delayHeaderHover = (nextHovered) => {
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }

    hoverDelayRef.current = window.setTimeout(() => {
      setHeaderHovered(nextHovered);
      hoverDelayRef.current = null;
    }, 180);
  };

  const handleNavClick = (event, href) => {
    if (!href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    setActiveNav(href);

    const targetTop = target.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
    window.history.pushState(null, "", href);
  };

  const handleLogout = () => {
    clearAuthTokens();
    clearStoredUserVerification();
    setIsAuthenticated(false);
    setMenuOpen(false);
  };

  // AOS fade-up simulator
  const faderProps = {
    initial: { opacity: 0, y: 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="landing-page w-full bg-primary-bg min-h-screen relative text-theme-text overflow-x-hidden transition-colors duration-500">
      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            key="coming-soon-toast"
            initial={{ opacity: 0, y: -8, x: "-50%", scale: 0.96 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -8, x: "-50%", scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-24 z-[90] inline-flex items-center gap-2 rounded-full border border-primary-text/45 bg-[#07070a] px-5 py-3 text-sm font-bold text-white shadow-[0_22px_70px_rgba(0,0,0,0.45)]"
          >
            <span className="h-2 w-2 rounded-full bg-primary-text shadow-[0_0_14px_rgba(75, 71, 255,0.9)]" />
            {toastMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
      >
        <motion.nav
          onPointerEnter={() => delayHeaderHover(true)}
          onPointerLeave={() => delayHeaderHover(false)}
          onFocusCapture={() => setHeaderFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setHeaderFocused(false);
            }
          }}
          layout
          initial={false}
          animate={{
            y: scrolled ? 8 : 0,
            maxWidth: isIsland ? 360 : 1200,
            height: isIsland ? 56 : 62,
            paddingLeft: isIsland ? 12 : 16,
            paddingRight: isIsland ? 12 : 16,
            boxShadow: isIsland
              ? "0 22px 58px -24px rgba(0,0,0,0.88), inset 0 1px 0 rgba(255,255,255,0.16)"
              : "0 24px 70px -30px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
          transition={ISLAND_TRANSITION}
          className="pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-full border border-[var(--nav-border)] bg-[var(--nav-bg)] text-[var(--nav-text)] shadow-[0_16px_48px_rgba(8,18,47,0.14)] backdrop-blur-2xl transition-colors duration-500 will-change-[max-width,transform]"
          style={{ transformOrigin: "top center" }}
        >
          <div className="pointer-events-none absolute inset-[1px] rounded-full bg-[var(--nav-shine)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[var(--nav-line)]" />

          <motion.div
            layout
            className="relative z-10 flex items-center shrink-0"
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={darklogo}
                alt="Eco Banx Logo"
                width={144}
                height={32}
                className="h-auto w-32 object-contain sm:w-36"
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Nav Links */}
          <motion.ul
            variants={HEADER_REVEAL_VARIANTS}
            initial={false}
            animate={headerRevealState}
            className="relative z-10 hidden md:flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap"
            style={{ pointerEvents: isIsland ? "none" : "auto" }}
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.label} variants={HEADER_TEXT_VARIANTS}>
                <a
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeNav === link.href
                      ? "bg-primary text-white shadow-[0_8px_24px_rgba(5,0,255,0.28)]"
                      : "text-[var(--nav-muted)] hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <motion.span
                    variants={HEADER_TEXT_VARIANTS}
                    className="block"
                  >
                    {link.label}
                  </motion.span>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          {/* Right side */}
          <motion.div
            layout
            className="relative z-10 hidden md:flex items-center gap-2 shrink-0"
          >
            {/* Theme toggle */}
            <motion.button
              layout
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--nav-border)] bg-[var(--nav-control)] hover:bg-primary/15 transition-colors duration-200 shrink-0"
            >
              {isDark ? (
                <Sun size={15} className="text-[var(--nav-muted)]" />
              ) : (
                <Moon size={15} className="text-[var(--nav-muted)]" />
              )}
            </motion.button>

            {/* Login */}
            <motion.div
              variants={HEADER_REVEAL_VARIANTS}
              initial={false}
              animate={headerRevealState}
              className="overflow-hidden whitespace-nowrap"
              style={{ pointerEvents: isIsland ? "none" : "auto" }}
            >
              <motion.div variants={HEADER_TEXT_VARIANTS}>
                <Link
                  href={isAuthenticated ? "/User/dashboard" : "/Auth/login"}
                  className="block rounded-full border border-[var(--nav-border)] px-5 py-2.5 text-sm font-medium text-[var(--nav-muted)] transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                >
                  <motion.span
                    variants={HEADER_TEXT_VARIANTS}
                    className="block"
                  >
                    {isAuthenticated ? "Dashboard" : "Login"}
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {isAuthenticated ? (
              <motion.button
                layout
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--nav-border)] bg-[var(--nav-control)] text-[var(--nav-muted)] transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
              >
                <LogOut size={16} />
              </motion.button>
            ) : (
              <motion.div layout className="shrink-0">
                <Button
                  onNavigate="/Auth/signup"
                  variant="primary"
                  rightIcon={<ArrowRight size={15} />}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border-white/10 hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 shadow-[inset_0px_1px_0px_0px_#FFFFFF40,0px_8px_24px_-8px_#4B47FF59] whitespace-nowrap"
                >
                  Get Started
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile actions */}
          <motion.div
            layout
            className="relative z-10 flex shrink-0 items-center gap-2 md:hidden"
          >
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--nav-border)] bg-[var(--nav-control)] text-[var(--nav-muted)]"
              >
                <LogOut size={17} />
              </button>
            ) : null}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--nav-border)] bg-[var(--nav-control)]"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} className="text-[var(--nav-muted)]" />
            </button>
          </motion.div>
        </motion.nav>
      </motion.header>
      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-primary-bg/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-72 bg-card-bg border-l border-input-border flex flex-col p-6 gap-8"
            >
              <div className="flex items-center justify-between">
                <Image
                  src={themedLogo}
                  alt="Eco Banx Logo"
                  width={144}
                  height={32}
                  className="h-auto w-36 object-contain"
                />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-input-border"
                >
                  <X size={16} className="text-theme-text" />
                </button>
              </div>

              <ul className="flex flex-col gap-5">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(event) => {
                        handleNavClick(event, link.href);
                        setMenuOpen(false);
                      }}
                      className={`block rounded-xl px-3 py-2 text-base font-semibold transition-colors ${
                        activeNav === link.href
                          ? "bg-primary/10 text-primary-text"
                          : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-input-border bg-secondary-bg text-theme-text text-sm font-normal"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <Link
                  href={isAuthenticated ? "/User/dashboard" : "/Auth/login"}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl border border-input-border text-center text-sm font-normal text-theme-text hover:bg-secondary-bg transition-colors"
                >
                  {isAuthenticated ? "Dashboard" : "Login"}
                </Link>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 rounded-xl border border-input-border px-4 py-3 text-sm font-semibold text-theme-text transition-colors hover:bg-secondary-bg"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                ) : (
                  <Button
                    onNavigate="/Auth/signup"
                    variant="primary"
                    rightIcon={<ArrowRight size={15} />}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-full hover:bg-primary-bg text-white text-sm font-semibold transition-all"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ------------------ HERO SECTION ------------------ */}
      <section
        id="home"
        className="relative isolate w-full min-h-screen overflow-hidden flex flex-col justify-center pt-24 lg:pt-0 sm:pt-0 bg-[var(--hero-bg)] text-[var(--hero-text)] transition-colors duration-500"
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_48%,var(--hero-glow),transparent_52%)] transition-colors duration-500" />
        <div className="landing-hero-art pointer-events-none absolute left-3 right-3 top-[67%] bottom-3 z-0 sm:top-[64%] lg:inset-y-20 lg:left-auto lg:right-[3%] lg:w-[49%]">
          <Image
            src={SecurityShield}
            alt=""
            fill
            preload
            sizes="(max-width: 1023px) 100vw, 49vw"
            className="landing-hero-image object-contain object-center p-4 sm:p-8"
          />
        </div>
        <div className="w-full max-w-[1440px] mx-auto py-16 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 z-10">
          {/* Hero Left Content */}
          <div className="flex flex-col items-center px-5 lg:w-[47%] lg:max-w-[600px] lg:flex-none lg:items-start lg:text-left space-y-6 max-w-3xl mt-15">
            {/* Live Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-text/30 bg-primary-text/10 w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-text opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-text" />
              </span>
              <span className="text-xs font-semibold text-primary-text">
                Now settling in 41 currencies
              </span>
            </motion.div>

            {/* Split Header */}
            <motion.h1
              variants={HERO_TITLE_VARIANTS}
              initial="hidden"
              animate="visible"
              className="max-w-[500px] text-2xl sm:text-3xl xl:text-4xl text-center lg:text-left font-bold text-[var(--hero-text)] leading-tight tracking-tight transition-colors duration-500"
            >
              {HERO_HEADLINE_LINES.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    variants={HERO_LINE_VARIANTS}
                    className="block will-change-transform"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-[var(--hero-muted)] text-center lg:text-left text-sm sm:text-base md:text-lg max-w-xl lg:max-w-[520px] leading-relaxed font-normal transition-colors duration-500"
            >
              Eco Banx Unifies Acquiring, Orchestration, Fraud Defense And
              Payouts Into A Single API — So Your Finance And Engineering Teams
              Move At The Speed The Business Needs.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button
                onNavigate={
                  isAuthenticated ? "/User/dashboard" : "/Auth/signup"
                }
                variant="primary"
                rightIcon={<ArrowRight size={15} />}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 shadow-[0_0_24px_rgba(75, 71, 255,0.4)] hover:scale-105 active:scale-[0.98] w-full sm:w-auto"
              >
                {isAuthenticated ? "Dashboard" : "Get Started"}
              </Button>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="grid grid-cols-3 gap-6 sm:gap-10 pt-10 w-[90%]"
            >
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-[var(--hero-text)] leading-none transition-colors duration-500">
                      {stat.value}
                    </span>
                    <span className="text-xs text-[var(--hero-muted)] leading-tight mt-0.5 transition-colors duration-500">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------ FEATURES SECTION ------------------ */}
      <section
        id="product"
        className="w-full py-17 bg-secondary-bg/20 relative"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 relative z-10">
          {/* Header */}
          <motion.div
            {...faderProps}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full bg-primary-text/20 border border-primary-text/20 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Platform
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
              Everything Money Movement Requires,{" "}
              <br className="hidden sm:inline" /> Under One Roof
            </p>
            <p className="text-secondary-text text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Acquiring, Orchestration, Risk And Treasury — Built As One System
              Instead Of Six Vendors Stitched Together.
            </p>
          </motion.div>

          {/* Grid Layout (6 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: "easeOut",
                  }}
                  style={{ background: "var(--cardbg)" }}
                  className="border border-input-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(75, 71, 255,0.08)] transition-all duration-300 group cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-text/15 border border-primary-text/20 flex items-center justify-center text-primary-text group-hover:scale-110 transition-transform duration-300">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-theme-text">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-text text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                  <a
                    href={feature.link}
                    className="flex items-center gap-1 text-sm font-semibold text-primary-text hover:text-primary-hover pt-6 transition-colors duration-200 mt-auto"
                  >
                    {feature.linkLabel}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------ AUTHORIZATION FLOW SECTION ------------------ */}
      <section id="solution" className="w-full py-17 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Green Arrow badge */}
            <motion.div
              {...faderProps}
              className="w-10 h-10 rounded-xl bg-primary-bg border border-primary-text/25 flex items-center justify-center text-primary"
            >
              <ArrowRight size={20} className="text-primary-text" />
            </motion.div>

            {/* Heading */}
            <motion.p
              {...faderProps}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight"
            >
              A Payment Flow Built For Authorization, Not Just Checkout
            </motion.p>

            {/* Description */}
            <motion.p
              {...faderProps}
              className="text-secondary-text text-md sm:text-base leading-relaxed font-normal"
            >
              Eco Banx Traces Every Transaction From Tokenization To Settlement,
              Retrying Intelligently And Surfacing Exactly Where Volume Is Lost.
            </motion.p>

            {/* Bullet Points */}
            <ul className="space-y-4 pt-2">
              {[
                "Network-Level Tokenization For Every Stored Card",
                "Automatic Retries Across Backup Acquirers",
                "Full Ledger Reconciliation, Exportable Anytime",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-sm sm:text-base text-secondary-text font-normal"
                >
                  <div className="w-5 h-5 rounded-full bg-primary-text/15 flex items-center justify-center text-primary-text shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            {/* <motion.div {...faderProps} className="pt-4">
              <Button onNavigate="/User/merchant">See How Routing Works</Button>
            </motion.div> */}
          </div>

          {/* Right Column Step Flow Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 bg-input-bg/40 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle glow layer */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />

            {/* Steps */}
            {[
              {
                icon: Smartphone,
                title: "Checkout Initiated",
                meta: "Visa •••• 4471 • $1,240.00",
                badge: "Tokenized",
                badgeStyle:
                  "bg-primary-text/10 text-primary-text border-primary-text/20",
              },
              {
                icon: ShieldAlert,
                title: "Risk Evaluation",
                meta: "Score 4/100 • 38ms",
                badge: "Approved",
                badgeStyle:
                  "bg-primary-text/10 text-primary-text border-primary-text/20",
              },
              {
                icon: Server,
                title: "Routed To Acquirer",
                meta: "Primary • EU-West",
                badge: "Authorized",
                badgeStyle:
                  "bg-primary-text/10 text-primary-text border-primary-text/20",
              },
              {
                icon: Database,
                title: "Settled To Ledger",
                meta: "T+1 • EUR Wallet",
                badge: "Settled",
                badgeStyle:
                  "bg-primary-text/10 text-primary-text border-primary-text/20",
              },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 py-2 border-b border-input-border/30 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-text/5 border border-primary-text flex items-center justify-center text-primary-text">
                      <StepIcon size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-theme-text">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-secondary-text mt-0.5">
                        {step.meta}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${step.badgeStyle}`}
                  >
                    {step.badge}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ------------------ Security and Compliance FLOW SECTION ------------------ */}
      <section id="security" className="w-full py-17 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Green Arrow badge */}
            <motion.div
              {...faderProps}
              className="w-10 h-10 rounded-xl bg-primary-bg border border-primary-text/25 flex items-center justify-center text-primary"
            >
              <ArrowRight size={20} className="text-primary-text" />
            </motion.div>

            {/* Heading */}
            <motion.p
              {...faderProps}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight"
            >
              Security and compliance that satisfies your auditors, not just
              your engineers
            </motion.p>

            {/* Description */}
            <motion.p
              {...faderProps}
              className="text-secondary-text text-md sm:text-base leading-relaxed font-normal"
            >
              PCI DSS Level 1, SOC 2 Type II and ISO 27001 come standard — with
              a real-time compliance dashboard your risk team can read without
              asking engineering.
            </motion.p>

            {/* Bullet Points */}
            <div className="space-y-4 grid grid-cols-2 pt-2 gap-3">
              {[
                "PCI DSS Level 1",
                "SOC 2 Type II",
                "ISO 27001",
                "GDPR ready",
              ].map((text, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="border border-input-border bg-[var(--chip-bg)] rounded-full p-3 h-12 flex justify-center items-center text-sm sm:text-base text-secondary-text font-medium"
                >
                  <span>{text}</span>
                </motion.span>
              ))}
            </div>

            {/* CTA Button */}
            {/* <motion.div {...faderProps} className="pt-4">
              <Button onNavigate="#security">View security overview</Button>
            </motion.div> */}
          </div>

          {/* Right Column Step Flow Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hidden md:block lg:col-span-6 bg-primary-bg/40 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle glow layer */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />
            <Image
              src={SecurityShield}
              alt="Blue glass security shield with a check mark"
              width={1254}
              height={1254}
              className="m-auto max-h-[420px] w-full object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* ------------------ GLOBAL SETTLEMENT SECTION ------------------ */}
      <section
        id="globalnetwork"
        className="w-full py-17  relative overflow-hidden"
      >
        <div className="mx-auto w-[92%] space-y-12 rounded-[28px] border border-input-border/70 bg-secondary-bg/50 px-6 py-9 shadow-[0_24px_72px_rgba(17,38,90,0.08)] relative z-10 sm:w-[88%] sm:space-y-14 sm:py-12 lg:w-[84%] lg:px-12 xl:px-20">
          {/* Header */}
          <motion.div
            {...faderProps}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full border border-primary-text/20 bg-primary-text/10 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Global network
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
              One Integration, Settlement <br /> Everywhere Your Customers Are
            </p>
            <p className="text-secondary-text text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Local Acquiring Partnerships And Direct Bank Rails Mean Money
              Reaches You Faster, With Fewer Failed Payments Along The Way.
            </p>
          </motion.div>

          {/* Bottom section image placeholder container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full aspect-[2/1] max-h-[230px] overflow-hidden flex items-center justify-center relative group cursor-pointer"
          >
            <Image
              src={Settlement}
              alt="Global banking network connected by blue payment settlement routes"
              width={1774}
              height={887}
              className="h-full w-full object-contain"
            />
          </motion.div>

          {/* Stats columns */}
          <motion.div
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8  pb-6"
          >
            {[
              { value: "180+", label: "Countries Covered" },
              { value: "41", label: "Settlement Currencies" },
              { value: "120+", label: "Local Acquiring Partners" },
              { value: "1.8s", label: "Median Payout Time" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                className="space-y-1.5"
              >
                <span className="text-xl sm:text-xl font-semibold text-secondary-text block leading-none">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-secondary-text font-normal block">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ------------------ CUSTOMERS / LEADERS SECTION ------------------ */}
      {/* <section id="customers" className="w-full py-17 relative overflow-hidden">
        <div className="w-[90%] max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 space-y-16 relative z-10">
         
          <motion.div
            {...faderProps}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full border border-primary-text/20 bg-primary-text/10 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Customers
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
              Finance And Engineering Leaders Run On Eco Banx
            </p>
            <p className="text-secondary-text text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Acquiring, Orchestration, Risk And Treasury — Built As One System
              Instead Of Six Vendors Stitched Together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEADERS.map((leader, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.1,
                  ease: "easeOut",
                }}
                className="relative backdrop-blur-xl border border-input-border rounded-[32px] aspect-[3/5] overflow-hidden flex flex-col justify-between  group shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div
                  className="absolute inset-0 opacity-15 mix-blend-color-dodge pointer-events-none group-hover:opacity-25 transition-opacity"
                  style={{
                    backgroundImage: `url(${LeadersBG.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div className="space-y-1 z-10 p-6 pb-0">
                  <span className="text-sm font-semibold text-theme-text block">
                    Global {leader.name}
                  </span>
                  <span className="text-md text-primary-text block">
                    {leader.role}
                  </span>
                </div>

                <div className="left-7 flex-1 z-10 relative overflow-hidden">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
      {/* ------------------ READY WHEN YOU ARE (CTA BANNER) ------------------ */}
      <section className="w-full py-12 relative overflow-hidden">
        <div className="w-[90%] max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full border border-white/15 rounded-[28px] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-[0_32px_90px_rgba(5,0,255,0.18)]"
            style={{ background: "var(--cta-bg)" }}
          >
            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#0500FF]/35 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-48 -left-20 h-80 w-80 rounded-full bg-[#316bff]/20 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:56px_56px]" />

            <div className="space-y-4 z-10 relative">
              <span className="px-3.5 py-1.5 rounded-full bg-primary-bg border border-primary-text/20 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
                Ready when you are
              </span>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-4xl mx-auto leading-tight">
                Move Your Payment Stack Onto Infrastructure Built For Scale
              </p>
              <p className="text-white text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
                Talk To Our Team About Migration, Or Get Sandbox Keys And Start
                Integrating In Minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center z-10 relative pt-4">
              <Button
                onNavigate="/Auth/signup"
                variant="primary"
                rightIcon={<ArrowRight size={15} />}
                className="text-white"
              >
                Get Started Free
              </Button>
              {/* <Button onNavigate="#contact">Talk To Sales</Button> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Four Products Section */}
      <section id="products" className="w-full py-17 relative overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 gap-12 items-center relative z-10">
          <div className="w-[90%] md:w-[60%] mx-auto text-center space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-primary-text/20 border border-primary-text/20 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Product suite
            </span>
            <motion.p
              {...faderProps}
              className=" text-2xl capitalize sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight"
            >
              Four products. One ledger. Zero reconciliation headaches.
            </motion.p>

            {/* Description */}
            <motion.p
              {...faderProps}
              className="text-secondary-text text-md sm:text-base leading-relaxed font-normal"
            >
              Acquiring, orchestration, fraud defense and payouts — built
              together so data never has to leave Eco Banx to make a decision.
            </motion.p>

            {/* Bullet Points */}
            <div className="w-full md:w-[90%] mx-auto space-y-4 grid grid-cols-2 md:grid-cols-4 pt-2 gap-3">
              {["Acquiring", "Orchestration", "Fraud defense", "Payouts"].map(
                (text, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="border border-input-border  bg-input-bg rounded-full p-3 h-10 flex justify-center items-center text-sm sm:text-base text-secondary-text font-medium"
                  >
                    <span>{text}</span>
                  </motion.span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Global Acquiring */}
      <section
        id="global acquiring"
        className="w-full py-17 bg-secondary-bg/15 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Widget */}

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-sm font-normal text-secondary-text tracking-widest block">
                PRODUCT 01
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-text/15 border border-primary-text/25 flex items-center justify-center text-primary">
                  <Globe size={18} className="text-primary-text" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
                  Global acquiring
                </p>
              </div>
            </div>

            <motion.p
              {...faderProps}
              className="text-secondary-text text-sm sm:text-base leading-relaxed font-normal"
            >
              Accept cards, wallets and bank transfers through local acquiring
              partnerships in 180+ countries. Local acquiring means fewer
              cross-border declines and lower interchange.
            </motion.p>

            <ul className="space-y-4 pt-2">
              {[
                "Visa, Mastercard, Amex, UnionPay and 40+ regional schemes",
                "Wallets: Apple Pay, Google Pay, UPI, WeChat Pay, Alipay",
                "Direct bank rails for ACH, SEPA and Faster Payments",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-sm sm:text-base text-secondary-text font-normal"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-primary-text shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 bg-secondary-bg/20 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />

            <p className="text-lg sm:text-base font-semibold text-theme-text">
              Accepted methods
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <CreditCard size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">Cards</span>
              </div>
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <Smartphone size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">
                  Mobile Wallets
                </span>
              </div>
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <CreditCard size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">
                  Bank Transfer
                </span>
              </div>
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <QrCode size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">QR Payments</span>
              </div>
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <Asterisk size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">UPI</span>
              </div>
              <div className="border border-input-border rounded-[10px] bg-secondary-bg/50 flex flex-col justify-between items-center p-4">
                <PlusCircle size={20} className="text-primary-text" />
                <span className="text-md text-secondary-text">
                  Direct Debit
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Smart Orchestration */}
      <section
        id="smart orchestration"
        className="w-full py-17 bg-secondary-bg/15 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 bg-secondary-bg/20 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />

            <p className="text-lg sm:text-base font-semibold text-theme-text">
              Live authorization rate by route
            </p>

            <div className="space-y-5">
              {[
                {
                  label: "Primary — EU acquirer",
                  sub: "62% of volume",
                  width: "w-[62%]",
                },
                {
                  label: "Backup — US acquirer",
                  sub: "24% of volume",
                  width: "w-[24%]",
                },
                {
                  label: "Regional — APAC acquirer",
                  sub: "14% of volume",
                  width: "w-[14%]",
                },
              ].map((route, idx) => (
                <div
                  key={idx}
                  className="border border-primary-text/15 p-2 bg-secondary-bg/90 rounded-xl flex flex-col md:flex-row justify-between items-center"
                >
                  <div className="flex flex-col gap-2">
                    <span className="twxt-sm text-theme-text">
                      {route.label}
                    </span>
                    <span className="text-xs text-secondary-text">
                      {route.sub}
                    </span>
                  </div>
                  <div className="w-[80%] md:w-[30%] mt-2 md:mt-0 h-2 bg-secondary-text/20 border border-white/15 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: route.width.replace("w-[", "").replace("]", ""),
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: idx * 0.15,
                        ease: "easeOut",
                      }}
                      className="h-full bg-primary-text rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-sm font-normal text-secondary-text tracking-widest block">
                PRODUCT 02
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-text/15 border border-primary-text/25 flex items-center justify-center text-primary">
                  <BoxIcon size={18} className="text-primary-text" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
                  Smart Orchestration
                </p>
              </div>
            </div>

            <motion.p
              {...faderProps}
              className="text-secondary-text text-sm sm:text-base leading-relaxed font-normal"
            >
              Orchestration rules evaluate cost, latency and historical approval
              rates in real time, then route each transaction down the path most
              likely to succeed.
            </motion.p>

            <ul className="space-y-4 pt-2">
              {[
                "Automatic failover to backup acquirers on decline",
                "Rule builder — no code required to change routing logic",
                "A/B Test Acquirers On Live Traffic With Statistical Confidence",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-sm sm:text-base text-secondary-text font-normal"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-primary-text shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {/* Fraud Defence */}
      <section
        id="fraud defence"
        className="w-full py-17 bg-secondary-bg/15 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Widget */}

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-sm font-normal text-secondary-text tracking-widest block">
                PRODUCT 03
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-text/15 border border-primary-text/25 flex items-center justify-center text-primary">
                  <Shield size={18} className="text-primary-text" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
                  Adaptive fraud defense
                </p>
              </div>
            </div>

            <motion.p
              {...faderProps}
              className="text-secondary-text text-sm sm:text-base leading-relaxed font-normal"
            >
              A machine-learned risk engine trained across the network scores
              every transaction in under 40 milliseconds — catching fraud
              without adding checkout friction for legitimate customers.
            </motion.p>

            <ul className="space-y-4 pt-2">
              {[
                "Device fingerprinting and behavioral signals",
                "Configurable risk thresholds per product line",
                "Chargeback representment tooling built in",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-sm sm:text-base text-secondary-text font-normal"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-primary-text shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 bg-secondary-bg/20 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />

            <p className="text-lg sm:text-base font-semibold text-theme-text">
              Risk distribution — last 24h
            </p>

            <div className="space-y-5">
              {[
                {
                  label: "Low risk",
                  sub: "94.2% of transactions",
                  width: "w-[62%]",
                },
                {
                  label: "Review required",
                  sub: "4.6% of transactions",
                  width: "w-[24%]",
                },
                {
                  label: "Blocked",
                  sub: "1.2% of transactions",
                  width: "w-[14%]",
                },
              ].map((route, idx) => (
                <div
                  key={idx}
                  className="border border-primary-text/15 p-2 bg-secondary-bg/90 rounded-xl flex justify-between items-center"
                >
                  <div className="flex flex-col gap-2">
                    <span className="twxt-sm text-theme-text">
                      {route.label}
                    </span>
                    <span className="text-xs text-secondary-text">
                      {route.sub}
                    </span>
                  </div>
                  <div className="w-[80%] md:w-[30%] mt-2 md:mt-0 h-2 bg-secondary-text/20 border border-white/15 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: route.width.replace("w-[", "").replace("]", ""),
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: idx * 0.15,
                        ease: "easeOut",
                      }}
                      className="h-full bg-primary-text rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      {/* ------------------ AUTOMATED PAYOUTS PRODUCT SECTION ------------------ */}
      <section
        id="payouts"
        className="w-full py-17 bg-secondary-bg/15 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6 bg-secondary-bg/20 backdrop-blur-2xl border border-input-border rounded-[18px] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-text/10 rounded-full blur-[48px] pointer-events-none" />

            <p className="text-lg sm:text-base font-semibold text-theme-text">
              Live authorization rate by route
            </p>

            <div className="space-y-5">
              {[
                {
                  label: "Primary — EU acquirer",
                  sub: "62% of volume",
                  width: "w-[62%]",
                },
                {
                  label: "Backup — US acquirer",
                  sub: "24% of volume",
                  width: "w-[24%]",
                },
                {
                  label: "Regional — APAC acquirer",
                  sub: "14% of volume",
                  width: "w-[14%]",
                },
              ].map((route, idx) => (
                <div
                  key={idx}
                  className="border border-primary-text/15 p-2 bg-secondary-bg/90 rounded-xl flex justify-between items-center"
                >
                  <div className="flex flex-col gap-2">
                    <span className="twxt-sm text-theme-text">
                      {route.label}
                    </span>
                    <span className="text-xs text-secondary-text">
                      {route.sub}
                    </span>
                  </div>
                  <div className="w-[80%] md:w-[30%] mt-2 md:mt-0 h-2 bg-secondary-text/20 border border-white/15 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: route.width.replace("w-[", "").replace("]", ""),
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1,
                        delay: idx * 0.15,
                        ease: "easeOut",
                      }}
                      className="h-full bg-primary-text rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-sm font-normal text-secondary-text tracking-widest block">
                PRODUCT 04
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-text/15 border border-primary-text/25 flex items-center justify-center text-primary">
                  <Wallet size={18} className="text-primary-text" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
                  Automated payouts
                </p>
              </div>
            </div>

            <motion.p
              {...faderProps}
              className="text-secondary-text text-sm sm:text-base leading-relaxed font-normal"
            >
              Split, Schedule And Reconcile Payouts To Merchants, Vendors And
              Marketplace Participants — With A Single Ledger Keeping Every
              Currency In Balance.
            </motion.p>

            <ul className="space-y-4 pt-2">
              {[
                "Scheduled, Instant Or Milestone-Based Payout Rules",
                "Rule Builder — No Code Required To Change Routing Logic",
                "A/B Test Acquirers On Live Traffic With Statistical Confidence",
              ].map((text, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-sm sm:text-base text-secondary-text font-normal"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-primary-text shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="solutions"
        className="w-full py-17 bg-secondary-bg/20 relative"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 relative z-10">
          {/* Header */}
          <motion.div
            {...faderProps}
            className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full bg-primary-text/20 border border-primary-text/20 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Solutions by industry
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
              Built for how your business actually{" "}
              <br className="hidden sm:inline" /> Moves Money
            </p>
            <p className="text-secondary-text text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              From marketplace payouts to recurring billing, Eco Banx configures
              around your model instead of forcing your model to fit a generic
              gateway.
            </p>
          </motion.div>

          {/* Grid Layout (6 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SOLUTIONS.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: "easeOut",
                  }}
                  style={{ background: "var(--cardbg)" }}
                  className="border border-input-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(75, 71, 255,0.08)] transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-text/15 border border-primary-text/20 flex items-center justify-center text-primary-text group-hover:scale-110 transition-transform duration-300">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-theme-text">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-text text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------ CONTACT FORM SECTION ------------------ */}
      {/* <section
        id="contact"
        className="w-full py-17 bg-secondary-bg/10 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20 space-y-12 relative z-10">
   
          <motion.div
            {...faderProps}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="px-3.5 py-1.5 rounded-full bg-primary-text/20 border border-primary-text/20 text-xs font-semibold text-primary-text inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
              Contact
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-text leading-tight">
              Send Us A Message
            </p>
            <p className="text-secondary-text text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Tell Us What&apos;s Going On And Which Account You&apos;re Writing
              About — We&apos;ll Route It To The Right Team.
            </p>
          </motion.div>

  
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-card-bg-normal/60 backdrop-blur-2xl border border-input-border rounded-[32px] p-6 sm:p-10 shadow-2xl relative"
          >
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <Input
                type="text"
                label="Full name"
                rounded="rounded-full"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Jordan Lee"
              />
              <Input
                type="email"
                label="Work email"
                value={email}
                rounded="rounded-full"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@company.com"
              />

              <Dropdown
                label="Topic"
                placeholder="Select Topic"
                className="rounded-xl w-full"
                 options={topicslist.map((country) => ({
                   label: topic,
                   value: topic,
                 }))}
              />

       
              <div className="space-y-2">
                <label className="text-xs mb-1 font-semibold text-secondary-text tracking-wide">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  rows={4}
                  className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-sm text-theme-text placeholder-secondary-text/50 focus:outline-none focus:border-primary-text/50 transition-colors resize-none"
                />
              </div>

       
              <Button
                type="submit"
                variant="primary"
                rightIcon={<Send size={15} />}
                className="w-full"
              >
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </section> */}

      {/* ------------------ FAQ SECTION ------------------ */}
      <section id="faq" className="w-full relative overflow-hidden">
        {/* Dark background card */}
        <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative overflow-hidden"
          >
            <div className="relative z-10 px-8 sm:px-14 md:px-20 py-12 sm:py-16">
              {/* Header */}
              <div className="text-center mb-14 space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-text/30 bg-primary-text/10 text-xs font-semibold text-primary-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-text animate-pulse" />
                  FAQ
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-text leading-tight">
                  Common Questions
                </h2>
              </div>

              {/* Accordion */}
              <div className="bg-secondary-bg p-6 rounded-[18px] max-w-3xl mx-auto divide-y divide-white/8">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="py-6">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-6 text-left group"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`text-base sm:text-lg font-semibold transition-colors duration-200 text-theme-text`}
                        >
                          {item.q}
                        </span>
                        <span
                          className={`shrink-0 w-7 h-7 flex text-primary-text items-center justify-center transition-all duration-200`}
                        >
                          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="pt-4 text-sm sm:text-base text-secondary-text leading-relaxed">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------ FOOTER SECTION ------------------ */}
      <footer
        id="footer"
        className="w-full border-t border-input-border py-17 relative overflow-hidden"
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10">
          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 pb-16 border-b border-input-border">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-2 flex flex-col gap-5">
              <Link href="#home" className="flex items-center gap-2 w-fit">
                <Image
                  src={themedLogo}
                  alt="Eco Banx"
                  width={144}
                  height={32}
                  className="h-auto w-36 object-contain"
                />
              </Link>

              <p className="text-secondary-text text-md leading-relaxed max-w-xs">
                Enterprise payment infrastructure for acquiring, orchestration,
                fraud defense and global payouts.
              </p>

              {/* Social links */}
              {/* <div className="flex items-center gap-3">
                {[
                  {
                    label: "X (Twitter)",
                    href: "#",
                    icon: (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.634 5.903-5.634Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                  {
                    label: "GitHub",
                    href: "#",
                    icon: (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    ),
                  },
                  {
                    label: "LinkedIn",
                    href: "#",
                    icon: (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    onClick={(event) => {
                      if (social.href === "#") {
                        event.preventDefault();
                        showComingSoon();
                      }
                    }}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full border border-input-border bg-card-bg-normal/40 flex items-center justify-center text-secondary-text hover:text-primary-text hover:border-primary-text/40 transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div> */}
            </div>

            {/* Nav columns */}
            {[
              {
                title: "Product",
                links: [
                  "Acquiring",
                  "Orchestration",
                  "Fraud Defense",
                  "Payouts",
                ],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Pricing"],
              },
              {
                title: "Solutions",
                links: [
                  "MArketplaces",
                  "Subscriptions",
                  "Retail & POS",
                  "Platforms",
                ],
              },
              {
                title: "Resources",
                links: ["API References", "Guides", "Blog", "Status"],
              },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <h4 className="text-md font-semibold text-theme-text tracking-widest">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          showComingSoon();
                        }}
                        className="text-sm text-secondary-text hover:text-primary-text transition-colors duration-200 font-normal"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-secondary-text">
            <span>
              © {new Date().getFullYear()} Eco Banx Technologies Ltd. All rights
              reserved.
            </span>
            <ul className="flex gap-5 justify-between items-center">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

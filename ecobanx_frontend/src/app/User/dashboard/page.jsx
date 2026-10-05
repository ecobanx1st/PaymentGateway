"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { io } from "socket.io-client";
import {
  AlertTriangle,
  ArrowUpRight,
  Bitcoin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleDollarSign,
  Gem,
  Landmark,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  WalletCards,
  DownloadIcon,
  PlusIcon,
  Link,
  Link2,
} from "lucide-react";
import Dollarsign from "@/components/assets/Dashboard/dollar.svg";
import Verify from "@/components/assets/Dashboard/verify.svg";
import Clock from "@/components/assets/Dashboard/clock.svg";
import Laptop from "@/components/assets/Dashboard/laptop-issue.svg";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/button";
import Image from "next/image";
import DateFilter from "@/components/ui/DateFilter";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Skeleton from "@/components/ui/skeleton";
import apiClient from "@/lib/axiosInterceptor";
import { getStoredAccessToken } from "@/lib/auth";
import { resolveBackendMediaUrl } from "@/lib/user-profile";
import { useStoredUserVerification } from "@/lib/user-verification-storage";
import { getAccountBaseRoute } from "@/utils/accountRoutes";
import {
  saveStoredSecurityActiveTab,
  SECURITY_PAGE_HREF,
  SECURITY_TAB_VERIFICATION,
} from "@/lib/security-tab-storage";
import { useEffect, useMemo, useRef, useState } from "react";

const summaryCards = [
  {
    id: "volume",
    value: "-",
    note: "Total Balance",
    icon: Dollarsign,
  },
  {
    id: "auth-rate",
    value: "-",
    note: "Total Deposits",
    icon: Dollarsign,
  },
  {
    id: "expected-clearance",
    value: "-",
    note: "Total Withdraws",
    icon: Dollarsign,
  },
  {
    id: "below-target",
    value: "",
    note: "Total API Keys",
    icon: Verify,
  },
];

const revenueTrend = [
  { day: "Jun 26", gross: 52, net: 34 },
  { day: "Jun 27", gross: 58, net: 39 },
  { day: "Jun 28", gross: 61, net: 38 },
  { day: "Jun 29", gross: 56, net: 35 },
  { day: "Jun 30", gross: 67, net: 41 },
  { day: "Jul 1", gross: 72, net: 46 },
  { day: "Jul 2", gross: 78, net: 48 },
  { day: "Jul 3", gross: 75, net: 47 },
  { day: "Jul 4", gross: 84, net: 53 },
  { day: "Jul 5", gross: 88, net: 55 },
  { day: "Jul 6", gross: 90, net: 57 },
  { day: "Jul 7", gross: 87, net: 56 },
  { day: "Jul 8", gross: 94, net: 59 },
  { day: "Jul 9", gross: 98, net: 61 },
];

const SOCKET_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3700/ecobanxApi"
).replace(/\/ecobanxApi\/?$/, "");
const MARKET_STREAM_BASE_URL =
  process.env.NEXT_PUBLIC_MARKET_STREAM_URL ||
  `wss://stream.${["bin", "ance"].join("")}.com:9443/stream?streams=`;
const MARKET_QUOTE_SYMBOL = "USDT";
const ASSET_TONES = [
  "#f7931a",
  "#627eea",
  "#21a67a",
  "#43b21f",
  "#111111",
  "#8b5cf6",
  "#eab308",
  "#f97316",
  "#0ea5e9",
  "#84cc16",
];
const ASSET_ICONS = {
  BTC: Bitcoin,
  ETH: Gem,
  USDC: CircleDollarSign,
  USDT: CircleDollarSign,
  BNB: Landmark,
  BUSD: Landmark,
  MATIC: Gem,
  POL: Gem,
  TRX: ShieldCheck,
};
const ASSET_LIST_KEYS = [
  "assets",
  "assetCoins",
  "coins",
  "coinPrices",
  "prices",
  "tickers",
  "marketRates",
  "docs",
  "data",
  "result",
  "items",
  "list",
];
const ASSET_SYMBOL_KEYS = [
  "assetSymbol",
  "symbol",
  "assets",
  "asset",
  "currency",
  "coin",
  "ticker",
  "code",
];
const ASSET_NAME_KEYS = [
  "assetName",
  "name",
  "assetFullName",
  "fullName",
  "currencyName",
  "coinName",
];
const ASSET_PRICE_KEYS = [
  "price",
  "usdPrice",
  "priceUsd",
  "priceUSD",
  "currentPrice",
  "lastPrice",
  "livePrice",
  "marketPrice",
  "assetPrice",
  "rate",
  "usdRate",
  "conversionRate",
];
const ASSET_CHANGE_KEYS = [
  "change",
  "changePercent",
  "percentChange",
  "priceChange",
  "priceChangePercent",
  "priceChange24h",
  "change24h",
  "price_change_percentage_24h",
];
const ASSET_AMOUNT_KEYS = [
  "free",
  "available",
  "availableBalance",
  "available_balance",
  "balance",
  "amount",
  "total",
];
const ASSET_IMAGE_KEYS = [
  "image",
  "assetImage",
  "asset_image",
  "imageUrl",
  "image_url",
  "icon",
  "logo",
  "assetIcon",
  "assetLogo",
  "thumbnail",
];
const MARKET_SOCKET_EVENT_PATTERN = /(asset|coin|price|ticker|market)/i;
const FIXED_USD_PRICES = new Map([
  ["USD", 1],
  ["USDT", 1],
  ["USDC", 1],
  ["BUSD", 1],
  ["FDUSD", 1],
  ["TUSD", 1],
  ["USDP", 1],
  ["DAI", 1],
]);

function normalizeSocketToken(token) {
  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : "";
}
const ASSET_MAP_RESERVED_KEYS = new Set([
  "code",
  "count",
  "data",
  "error",
  "limit",
  "message",
  "page",
  "result",
  "status",
  "success",
  "total",
]);

const EMPTY_DASHBOARD_PAGINATION = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const DASHBOARD_STATUS_LABELS = {
  COMPLETED: "Success",
  SUCCESS: "Success",
  PENDING: "Pending",
  FAILED: "Failed",
  REJECTED: "Failed",
  CANCELLED: "Failed",
  CANCELED: "Failed",
};

const baseRoute = getAccountBaseRoute();

function pickString(source, keys) {
  if (!source || typeof source !== "object") return "";

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value))
      return String(value);
  }

  return "";
}
const accountType = window.localStorage.getItem("accountType") || "";

function parseNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const normalized = value.replace(/[$,%\s,]/g, "");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickNumber(source, keys) {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    if (source[key] === undefined || source[key] === null) continue;
    const value = parseNumber(source[key]);
    if (value !== null) return value;
  }

  return null;
}

function getFixedUsdPrice(symbol) {
  return FIXED_USD_PRICES.get(String(symbol || "").toUpperCase()) ?? null;
}

function getAssetPriceValue(asset) {
  const price = pickNumber(asset, ASSET_PRICE_KEYS);
  if (price !== null) return price;

  return getFixedUsdPrice(getRawAssetSymbol(asset));
}

function normalizeAssetPrices(assets) {
  return assets.map((asset) => {
    const symbol = getRawAssetSymbol(asset);
    const existingPrice = pickNumber(asset, ASSET_PRICE_KEYS);
    const fixedPrice = getFixedUsdPrice(symbol);

    if (existingPrice !== null || fixedPrice === null) return asset;

    return {
      ...asset,
      price: fixedPrice,
      priceUpdatedAt: asset.priceUpdatedAt || new Date().toISOString(),
    };
  });
}

function getMarketPairSymbol(symbol) {
  const normalizedSymbol = String(symbol || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!normalizedSymbol || getFixedUsdPrice(normalizedSymbol) !== null)
    return "";
  if (
    normalizedSymbol.endsWith(MARKET_QUOTE_SYMBOL) &&
    normalizedSymbol.length > MARKET_QUOTE_SYMBOL.length
  ) {
    return normalizedSymbol;
  }

  return `${normalizedSymbol}${MARKET_QUOTE_SYMBOL}`;
}

function getMarketBaseSymbol(pairSymbol) {
  const normalizedPair = String(pairSymbol || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (
    normalizedPair.endsWith(MARKET_QUOTE_SYMBOL) &&
    normalizedPair.length > MARKET_QUOTE_SYMBOL.length
  ) {
    return normalizedPair.slice(0, -MARKET_QUOTE_SYMBOL.length);
  }

  return normalizedPair;
}

function getAssetPriceStreamNames(assets) {
  const seen = new Set();

  return assets
    .map((asset) => getMarketPairSymbol(getRawAssetSymbol(asset)))
    .filter(Boolean)
    .filter((pairSymbol) => {
      if (seen.has(pairSymbol)) return false;
      seen.add(pairSymbol);
      return true;
    })
    .map((pairSymbol) => `${pairSymbol.toLowerCase()}@ticker`);
}

function getStreamPairSymbol(payload, data) {
  const directSymbol = pickString(data, ["s", "symbol", "pair"]).toUpperCase();
  if (directSymbol) return directSymbol.replace(/[^A-Z0-9]/g, "");

  const streamName = pickString(payload, ["stream"]).toUpperCase();
  if (!streamName) return "";

  return streamName.split("@")[0].replace(/[^A-Z0-9]/g, "");
}

function getMarketStreamAssetUpdate(payload) {
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  if (!data || Array.isArray(data) || typeof data !== "object") return null;

  const price =
    parseNumber(data.c) ??
    parseNumber(data.lastPrice) ??
    parseNumber(data.price) ??
    pickNumber(data, ASSET_PRICE_KEYS);
  if (price === null) return null;

  const pairSymbol = getStreamPairSymbol(payload, data);
  const symbol = getMarketBaseSymbol(pairSymbol);
  if (!symbol) return null;

  const openPrice = parseNumber(data.o);
  const directChange =
    parseNumber(data.P) ??
    parseNumber(data.priceChangePercent) ??
    pickNumber(data, ASSET_CHANGE_KEYS);
  const change =
    directChange ??
    (openPrice && price ? ((price - openPrice) / openPrice) * 100 : null);

  return {
    symbol,
    price,
    priceChangePercent: change,
    priceUpdatedAt: new Date().toISOString(),
  };
}

function getMarketStreamAssetUpdates(payload) {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data
      .map((item) => getMarketStreamAssetUpdate({ data: item }))
      .filter(Boolean);
  }

  const update = getMarketStreamAssetUpdate(payload);
  return update ? [update] : [];
}

function findAssetList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  for (const key of ASSET_LIST_KEYS) {
    const list = findAssetList(value[key]);
    if (list) return list;
  }

  return null;
}

function getAssetMapList(value) {
  if (!value || Array.isArray(value) || typeof value !== "object") return [];

  return Object.entries(value)
    .map(([symbol, item]) => {
      const normalizedSymbol = symbol.trim();
      const canUseMapSymbol =
        /^[a-z0-9._-]{2,20}$/i.test(normalizedSymbol) &&
        !ASSET_MAP_RESERVED_KEYS.has(normalizedSymbol.toLowerCase());

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        const price = parseNumber(item);
        return price === null || !canUseMapSymbol
          ? null
          : { symbol: normalizedSymbol, price };
      }

      const itemSymbol = getRawAssetSymbol(item);
      const hasAssetShape =
        itemSymbol ||
        ASSET_NAME_KEYS.some((key) => item[key] !== undefined) ||
        ASSET_PRICE_KEYS.some((key) => item[key] !== undefined);
      if (!hasAssetShape) return null;
      if (!itemSymbol && !canUseMapSymbol) return null;

      return itemSymbol ? item : { symbol: normalizedSymbol, ...item };
    })
    .filter(Boolean)
    .filter(isAssetRecord);
}

function getRawAssetSymbol(asset) {
  return pickString(asset, ASSET_SYMBOL_KEYS).toUpperCase();
}

function isAssetRecord(value) {
  return Boolean(
    value && typeof value === "object" && getRawAssetSymbol(value),
  );
}

function getAssetUpdateList(payload) {
  const list = findAssetList(payload);
  if (list) return list.filter(isAssetRecord);

  const candidates = [
    payload,
    payload?.data,
    payload?.result,
    payload?.asset,
    payload?.coin,
    payload?.ticker,
    payload?.price,
    payload?.prices,
    payload?.tickers,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.filter(isAssetRecord);
    if (isAssetRecord(candidate)) return [candidate];

    const mappedAssets = getAssetMapList(candidate);
    if (mappedAssets.length) return mappedAssets;
  }

  return [];
}

function getAssetId(asset, index) {
  return (
    pickString(asset, ["_id", "id", "assetId"]) ||
    getRawAssetSymbol(asset) ||
    `asset-${index}`
  );
}

function mergeAssetUpdates(currentAssets, incomingAssets) {
  if (!incomingAssets.length) return currentAssets;

  const merged = [...currentAssets];
  const indexByKey = new Map();

  merged.forEach((asset, index) => {
    const symbol = getRawAssetSymbol(asset);
    const id = pickString(asset, ["_id", "id", "assetId"]);
    if (symbol) indexByKey.set(symbol, index);
    if (id) indexByKey.set(id, index);
  });

  incomingAssets.forEach((asset, index) => {
    const symbol = getRawAssetSymbol(asset);
    const id = pickString(asset, ["_id", "id", "assetId"]);
    const mergeKey = symbol || id;
    const existingIndex = mergeKey ? indexByKey.get(mergeKey) : undefined;

    if (existingIndex === undefined) {
      merged.push(asset);
      if (mergeKey) indexByKey.set(mergeKey, merged.length - 1);
      return;
    }

    merged[existingIndex] = {
      ...merged[existingIndex],
      ...asset,
      networks: asset.networks ?? merged[existingIndex].networks,
      networkIds: asset.networkIds ?? merged[existingIndex].networkIds,
      updatedAt:
        asset.updatedAt || asset.priceUpdatedAt || new Date().toISOString(),
      _dashboardOrder: merged[existingIndex]._dashboardOrder ?? index,
    };
  });

  return merged;
}

function getNetworkRecord(network) {
  if (network?.networkId && typeof network.networkId === "object") {
    return network.networkId;
  }

  return network;
}

function getNetworkLabel(asset) {
  const networks = Array.isArray(asset?.networks)
    ? asset.networks
    : Array.isArray(asset?.networkIds)
      ? asset.networkIds
      : [];

  const labels = networks
    .map((network) => {
      const networkRecord = getNetworkRecord(network);
      return pickString(networkRecord, [
        "networkSymbol",
        "networkName",
        "chainId",
        "type",
      ]);
    })
    .filter(Boolean)
    .slice(0, 2);

  return labels.length
    ? labels.join(" + ")
    : pickString(asset, ["network", "networkName", "networkSymbol", "chain"]);
}

function getAssetImageUrl(asset) {
  return resolveBackendMediaUrl(pickString(asset, ASSET_IMAGE_KEYS));
}

function formatTokenAmount(value, symbol) {
  const amount = value ?? 0;

  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: amount === 0 ? 4 : 8,
  })} ${symbol}`;
}

function formatUsdPrice(value) {
  if (value === null || value === undefined) return "-";

  const num = Number(value);

  if (!Number.isFinite(num)) return "-";

  const absoluteValue = Math.abs(num);

  const units = [
    { value: 1e12, label: "Trillion" },
    { value: 1e9, label: "Billion" },
    { value: 1e6, label: "Million" },
  ];

  const unit = units.find((unit) => absoluteValue >= unit.value);

  if (unit) {
    const formattedValue = (num / unit.value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return `$${formattedValue} ${unit.label}`;
  }

  // For values below 1000, preserve useful decimals
  const maximumFractionDigits =
    absoluteValue >= 1 ? 2 : absoluteValue >= 0.01 ? 4 : 8;

  const minimumFractionDigits =
    absoluteValue >= 1 ? 2 : absoluteValue >= 0.01 ? 4 : 4;

  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

function formatTotalUsdtBalance(value) {
  return formatUsdPrice(value);
}

function getDashboardResult(payload) {
  const result =
    payload?.result ?? payload?.data?.result ?? payload?.data ?? payload;
  return result && typeof result === "object" ? result : {};
}

function normalizeDashboardStatus(status) {
  const value = String(status || "")
    .trim()
    .toUpperCase();
  if (!value) return "Pending";
  return (
    DASHBOARD_STATUS_LABELS[value] ||
    value.charAt(0) + value.slice(1).toLowerCase()
  );
}

function formatDashboardDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDashboardAmount(transaction) {
  const amount = parseNumber(transaction?.amount);
  if (amount === null) return "-";

  const assetSymbol = pickString(transaction, [
    "assetSymbol",
    "symbol",
    "asset",
  ]);
  if (assetSymbol) {
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })} ${assetSymbol}`;
  }

  return formatUsdPrice(amount);
}

function formatDashboardMethod(transaction) {
  const type = pickString(transaction, ["type"]);
  const assetSymbol = pickString(transaction, [
    "assetSymbol",
    "symbol",
    "asset",
  ]);
  const network = pickString(transaction, [
    "network",
    "networkSymbol",
    "chain",
  ]);
  const assetNetwork = [assetSymbol, network].filter(Boolean).join("/");

  return [type, assetNetwork].filter(Boolean).join(" - ") || "-";
}

function truncateMiddle(value, start = 12, end = 8) {
  const text = String(value || "").trim();
  if (!text) return "-";
  if (text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function normalizeDashboardTransaction(transaction, index) {
  const transactionId = pickString(transaction, ["transactionId", "id", "_id"]);
  const fallbackId = `${pickString(transaction, ["type"]) || "transaction"}-${transaction?.createdAt || index}`;
  const customerName = pickString(transaction, [
    "customerName",
    "customer",
    "name",
  ]);

  return {
    id: transactionId || fallbackId,
    transactionId: truncateMiddle(transactionId),
    customer: customerName || "-",
    email: pickString(transaction, ["email", "customerEmail"]) || "-",
    method: formatDashboardMethod(transaction),
    amount: formatDashboardAmount(transaction),
    status: normalizeDashboardStatus(transaction?.status),
    date: formatDashboardDate(transaction?.createdAt),
  };
}

function normalizeDashboardPagination(pagination) {
  if (!pagination || typeof pagination !== "object") {
    return EMPTY_DASHBOARD_PAGINATION;
  }

  return {
    total: parseNumber(pagination.total) ?? 0,
    page: parseNumber(pagination.page) ?? 1,
    limit: parseNumber(pagination.limit) ?? 10,
    totalPages: parseNumber(pagination.totalPages) ?? 1,
  };
}
function formatPercentChange(value) {
  if (value === null) return "Live";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function createDashboardAsset(asset, index) {
  const symbol = getRawAssetSymbol(asset) || "ASSET";
  const priceValue = getAssetPriceValue(asset);
  const changeValue = pickNumber(asset, ASSET_CHANGE_KEYS);
  const amount = pickNumber(asset, ASSET_AMOUNT_KEYS);
  const direction =
    changeValue === null
      ? "flat"
      : changeValue > 0
        ? "up"
        : changeValue < 0
          ? "down"
          : "flat";

  return {
    id: getAssetId(asset, index),
    symbol,
    name: pickString(asset, ASSET_NAME_KEYS) || symbol,
    amount: formatTokenAmount(amount, symbol),
    network: getNetworkLabel(asset) || "Supported asset",
    price: formatUsdPrice(priceValue),
    change: formatPercentChange(changeValue),
    direction,
    icon: ASSET_ICONS[symbol] || CircleDollarSign,
    imageUrl: getAssetImageUrl(asset),
    tone:
      pickString(asset, ["color", "tone", "themeColor"]) ||
      ASSET_TONES[index % ASSET_TONES.length],
  };
}

function getMarketStatusLabel({ loading, connected, lastUpdated }) {
  if (loading) return "Loading";
  if (connected) return "Live";
  if (lastUpdated) return "Updated";
  return "Loading";
}

function StatCard({ value, note, icon: Icon }) {
  return (
    <article
      className="flex h-full min-h-[170px] flex-col justify-between rounded-[18px] border border-input-border p-5 shadow-[0_0_15px_0_#4B47FF26] transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--cardbg)" }}
    >
      <div className="w-10 h-10 rounded-[14px] flex justify-center items-center border border-input-border bg-secondary-bg">
        <Image
          src={Icon}
          alt=""
          width={20}
          height={20}
          className="text-primary-text"
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-theme-text sm:text-[2rem]">
        {value}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm ">
        <span className="text-secondary-text">{note}</span>
      </div>
    </article>
  );
}

function AssetBadge({ icon: Icon, imageUrl, symbol, tone, size = "md" }) {
  const isSmall = size === "sm";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(0,0,0,0.18)] ${
        isSmall ? "h-9 w-9" : "h-11 w-11"
      }`}
      // style={{
      //   background: `linear-gradient(135deg, ${tone} 0%, color-mix(in srgb, ${tone} 76%, #ffffff) 100%)`,
      // }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Asset logos can come from backend-configured URLs.
        <img
          src={imageUrl}
          alt=""
          className="h-[85%] w-[85%] rounded-full object-contain"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : Icon ? (
        <Icon size={isSmall ? 18 : 21} strokeWidth={2.4} />
      ) : (
        <span className="text-[11px] font-bold">{symbol.slice(0, 3)}</span>
      )}
    </span>
  );
}

function PortfolioAsset({ asset }) {
  return (
    <div className="group flex min-h-[130px] flex-col justify-between rounded-[18px] border border-input-border bg-primary-bg/70 p-3 shadow-[0_16px_34px_rgba(8,19,12,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[0_18px_42px_rgba(75, 71, 255,0.15)]">
      <div className="flex items-start justify-between gap-2">
        <AssetBadge
          icon={asset.icon}
          imageUrl={asset.imageUrl}
          symbol={asset.symbol}
          tone={asset.tone}
        />
        <span className="rounded-full border border-input-border bg-input-bg px-2 py-1 text-[10px] font-bold uppercase text-secondary-text">
          {asset.symbol}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <p className="truncate text-sm font-bold text-theme-text">
          {asset.name}
        </p>
        <p className="mt-1 truncate text-xs text-secondary-text">
          {asset.network}
        </p>
        <p className="mt-3 truncate font-mono text-[13px] font-semibold text-theme-text">
          {asset.amount}
        </p>
      </div>
    </div>
  );
}

function MarketRateCard({ asset, className = "" }) {
  const isUp = asset.direction === "up";
  const isDown = asset.direction === "down";
  const trendClass = isUp
    ? "bg-emerald-500/10 text-emerald-500"
    : isDown
      ? "bg-red-500/10 text-red-500"
      : "bg-secondary-bg text-secondary-text";

  return (
    <article
      className={`group rounded-[18px] border border-input-border bg-primary-bg p-4 shadow-[0_14px_30px_rgba(8,19,12,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/55 hover:shadow-[0_18px_42px_rgba(75, 71, 255,0.14)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AssetBadge
            icon={asset.icon}
            imageUrl={asset.imageUrl}
            symbol={asset.symbol}
            tone={asset.tone}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-theme-text">
              {asset.name}
            </p>
            <p className="text-[11px] font-semibold uppercase text-secondary-text">
              {asset.symbol}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${trendClass}`}
        >
          {isUp ? (
            <TrendingUp size={12} />
          ) : isDown ? (
            <TrendingDown size={12} />
          ) : (
            <RefreshCcw size={12} />
          )}
          {asset.change}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="truncate text-lg font-bold tracking-tight text-theme-text">
          {asset.price}
        </p>
      </div>
    </article>
  );
}

function MarketRateCardSkeleton({ className = "" }) {
  return (
    <article
      className={`rounded-[18px] border border-input-border bg-primary-bg p-4 shadow-[0_14px_30px_rgba(8,19,12,0.05)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-secondary-bg" />
          <span className="min-w-0 space-y-2">
            <span className="block h-3 w-24 animate-pulse rounded-full bg-secondary-bg" />
            <span className="block h-2.5 w-12 animate-pulse rounded-full bg-secondary-bg" />
          </span>
        </div>
        <span className="h-6 w-14 shrink-0 animate-pulse rounded-full bg-secondary-bg" />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="h-5 w-28 animate-pulse rounded-full bg-secondary-bg" />
        <span className="h-1.5 w-12 animate-pulse rounded-full bg-secondary-bg" />
      </div>
    </article>
  );
}

function DashboardSummaryGrid({
  apiKeyTotalDocs = null,
  totalUsdtBalance = null,
  totalDeposits = null,
  totalWithdrawals = null,
}) {
  const storedAccountType =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accountType") || ""
      : "";
  const isBusiness =
    String(storedAccountType).trim().toLowerCase() === "business";
  // Total API Keys is business-only; business sees all cards.
  const visibleCards = isBusiness
    ? summaryCards
    : summaryCards.filter((card) => card.id !== "below-target");
  const cards = visibleCards.map((card) =>
    card.id === "volume"
      ? { ...card, value: formatTotalUsdtBalance(totalUsdtBalance) }
      : card.id === "auth-rate"
        ? { ...card, value: formatTotalUsdtBalance(totalDeposits) }
        : card.id === "expected-clearance"
          ? { ...card, value: formatTotalUsdtBalance(totalWithdrawals) }
          : card.id === "below-target"
            ? {
                ...card,
                value: apiKeyTotalDocs === null ? "-" : apiKeyTotalDocs,
              }
            : card,
  );

  return (
    <section className="grid h-full gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  sm:auto-rows-fr">
      {cards.map((card) => (
        <StatCard key={card.id} {...card} />
      ))}
    </section>
  );
}

function TotalBalanceCard({
  assets = [],
  totalUsdtBalance = null,
  className = "",
}) {
  const totalUsdtDisplay = formatTotalUsdtBalance(totalUsdtBalance);

  return (
    <article
      className={`dashboard-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] p-5 sm:p-6 ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--primary-gradient)]" />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-secondary-text">
            <WalletCards size={17} />
            Total Balance
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-theme-text sm:text-4xl">
              {totalUsdtDisplay}
            </h2>
            <span className="mb-1 rounded-full bg-primary px-3 py-1 text-sm font-bold text-white shadow-[0_12px_24px_rgba(5, 0, 255,0.28)]">
              USD
            </span>
          </div>
          <p className="mt-2 text-sm text-secondary-text">
            Balances across supported settlement assets.
          </p>
        </div>

        <Button
          value="Go to Wallet"
          variant="primary"
          rightIcon={<ArrowUpRight size={16} />}
          onNavigate="/User/mywallet"
          className="h-10 w-full border-0 px-4 text-sm text-white sm:w-auto"
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-theme-text">
          Portfolio
        </h2>
        <span className="rounded-full border border-input-border bg-input-bg px-3 py-1 text-xs font-bold text-secondary-text">
          {assets.length} assets enabled
        </span>
      </div>

      {assets.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {assets.map((asset) => (
            <PortfolioAsset key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[16px] border border-dashed border-input-border bg-primary-bg/60 p-5 text-center text-sm font-semibold text-secondary-text">
          No asset coin data available.
        </div>
      )}
    </article>
  );
}

function MarketWatchSection({
  assets = [],
  loading = false,
  error = "",
  socketConnected = false,
  lastUpdated = "",
}) {
  const carouselRef = useRef(null);
  const statusLabel = getMarketStatusLabel({
    loading,
    connected: socketConnected,
    lastUpdated,
  });
  const skeletonCount = Math.max(assets.length || 0, 4);
  const carouselItemClass =
    "min-h-[138px] w-[min(78vw,18rem)] shrink-0 snap-start sm:w-[18rem] lg:w-[19rem]";

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * Math.min(carousel.clientWidth * 0.82, 640),
      behavior: "smooth",
    });
  };

  return (
    <section className="min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-theme-text">
            Live pricing
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            Live pricing for supported asset coins
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <span className="inline-flex items-center gap-2 rounded-full border border-input-border bg-input-bg px-3 py-1 text-xs font-bold text-secondary-text">
            <RefreshCcw size={13} />
            {statusLabel}
          </span> */}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label="Previous live price"
              onClick={() => scrollCarousel(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-input-bg text-secondary-text transition hover:border-primary hover:text-primary"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next live price"
              onClick={() => scrollCarousel(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-input-bg text-secondary-text transition hover:border-primary hover:text-primary"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-200">
          {error}
        </div>
      ) : null}

      {loading || assets.length ? (
        <div className="relative min-w-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[var(--dashboardbg)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[var(--dashboardbg)] to-transparent" />
          <div
            ref={carouselRef}
            data-lenis-prevent="true"
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: skeletonCount }).map((_, index) => (
                  <MarketRateCardSkeleton
                    key={`asset-price-loading-${index}`}
                    className={carouselItemClass}
                  />
                ))
              : assets.map((asset) => (
                  <MarketRateCard
                    key={asset.id}
                    asset={asset}
                    className={carouselItemClass}
                  />
                ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-input-border bg-primary-bg p-8 text-center text-sm font-semibold text-secondary-text">
          No asset coin data available.
        </div>
      )}
    </section>
  );
}

function DashboardTopSection({
  assets,
  assetLoading,
  assetError,
  socketConnected,
  lastUpdated,
  apiKeyTotalDocs,
  totalUsdtBalance,
  totalDeposits,
  totalWithdrawals,
}) {
  return (
    <section className="grid items-stretch gap-5">
      <DashboardSummaryGrid
        apiKeyTotalDocs={apiKeyTotalDocs}
        totalUsdtBalance={totalUsdtBalance}
        totalDeposits={totalDeposits}
        totalWithdrawals={totalWithdrawals}
      />
      <MarketWatchSection
        assets={assets}
        loading={assetLoading}
        error={assetError}
        socketConnected={socketConnected}
        lastUpdated={lastUpdated}
      />
    </section>
  );
}

function RevenueTrendCard() {
  return (
    <article className="bg-primary-bg rounded-[18px] border border-input-border p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text">
            Revenue trend
          </h2>
          <p className="mt-1 text-sm text-secondary-text">
            Gross volume vs. net settled over the last 14 days
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-secondary-text">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
            Gross volume
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--info)]" />
            Net settled
          </span>
        </div>
      </div>

      <div className="mt-6 h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueTrend}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.34}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--info)" stopOpacity={0.22} />
                <stop
                  offset="100%"
                  stopColor="var(--info)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={14}
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            />
            <Tooltip
              cursor={{
                stroke: "var(--primary)",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid var(--border-color)",
                background: "var(--surface-strong)",
                boxShadow: "var(--shadow-soft)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="gross"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#grossFill)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="net"
              stroke="var(--info)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#netFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function getDashboardVerificationStatus(verification) {
  if (verification?.loading || verification?.approved) return null;

  if (verification?.blocked) {
    const label = verification.label || "KYC";

    return {
      icon: AlertTriangle,
      label: `Verify ${label}`,
      message:
        verification.message ||
        `Complete ${label} verification to unlock withdrawals and settlements.`,
      wrapperClass: "border-amber-400/30 bg-amber-400/10",
      textClass: "text-amber-400",
    };
  }

  return null;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assetCoins, setAssetCoins] = useState([]);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [assetSocketConnected, setAssetSocketConnected] = useState(false);
  const [marketStreamConnected, setMarketStreamConnected] = useState(false);
  const [assetLastUpdated, setAssetLastUpdated] = useState("");
  const [apiKeyTotalDocs, setApiKeyTotalDocs] = useState(null);
  const [totalUsdtBalance, setTotalUsdtBalance] = useState(null);
  const [totalDeposits, setTotalDeposits] = useState(null);
  const [totalWithdrawals, setTotalWithdrawals] = useState(null);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [dashboardPagination, setDashboardPagination] = useState(
    EMPTY_DASHBOARD_PAGINATION,
  );
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const dashboardAssets = useMemo(
    () => assetCoins.map((asset, index) => createDashboardAsset(asset, index)),
    [assetCoins],
  );
  const assetPriceStreamKey = useMemo(
    () => getAssetPriceStreamNames(assetCoins).join("/"),
    [assetCoins],
  );
  const marketLoading = assetLoading;
  const livePriceConnected = assetPriceStreamKey
    ? marketStreamConnected
    : assetSocketConnected;
  const verification = useStoredUserVerification();
  const verificationStatus = getDashboardVerificationStatus(verification);
  const VerificationIcon = verificationStatus?.icon;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError("");

      if (!getStoredAccessToken()) {
        if (!cancelled) {
          setTotalUsdtBalance(null);
          setTotalDeposits(null);
          setTotalWithdrawals(null);
          setApiKeyTotalDocs(null);
          setDashboardTransactions([]);
          setDashboardPagination(EMPTY_DASHBOARD_PAGINATION);
          setDashboardError("Login token is missing. Please sign in again.");
          setDashboardLoading(false);
        }
        return;
      }

      try {
        const response = await apiClient.post(`${baseRoute}/dashboard-data`);
        const result = getDashboardResult(response.data);
        const transactions = Array.isArray(result.recentTransactions)
          ? result.recentTransactions
          : [];

        if (!cancelled) {
          setTotalUsdtBalance(parseNumber(result.totalBalance));
          setTotalDeposits(parseNumber(result.totalDeposits));
          setTotalWithdrawals(parseNumber(result.totalWithdrawals));
          setApiKeyTotalDocs(parseNumber(result.totalApis) ?? 0);
          setDashboardTransactions(
            transactions.map((transaction, index) =>
              normalizeDashboardTransaction(transaction, index),
            ),
          );
          setDashboardPagination(
            normalizeDashboardPagination(result.transactionPagination),
          );
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (!cancelled) {
          setTotalUsdtBalance(null);
          setTotalDeposits(null);
          setTotalWithdrawals(null);
          setApiKeyTotalDocs(null);
          setDashboardTransactions([]);
          setDashboardPagination(EMPTY_DASHBOARD_PAGINATION);
          setDashboardError(
            error instanceof Error && error.message
              ? error.message
              : "Could not load dashboard data.",
          );
        }
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAssetList = async () => {
      setAssetLoading(true);
      setAssetError("");

      if (!getStoredAccessToken()) {
        if (!cancelled) {
          setAssetCoins([]);
          setAssetError("Login token is missing. Please sign in again.");
          setAssetLoading(false);
        }
        return;
      }

      try {
        const response = await apiClient.post(`${baseRoute}/asset/list`);

        if (cancelled) return;

        if (response.data?.success === false) {
          setAssetCoins([]);
          setAssetError(
            response.data?.message || "Could not load asset coin data.",
          );
          return;
        }

        const assets = normalizeAssetPrices(getAssetUpdateList(response.data));
        setAssetCoins(assets);
        setAssetLastUpdated(assets.length ? new Date().toISOString() : "");
      } catch (error) {
        console.error("Failed to load asset list:", error);
        if (!cancelled) {
          setAssetCoins([]);
          setAssetError(
            error instanceof Error && error.message
              ? error.message
              : "Could not load asset coin data.",
          );
        }
      } finally {
        if (!cancelled) setAssetLoading(false);
      }
    };

    loadAssetList();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token = normalizeSocketToken(getStoredAccessToken());

    if (!token || !SOCKET_URL) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    const mergeIncomingAssets = (payload) => {
      const incomingAssets = normalizeAssetPrices(getAssetUpdateList(payload));
      if (!incomingAssets.length) return;

      setAssetCoins((currentAssets) =>
        mergeAssetUpdates(currentAssets, incomingAssets),
      );
      setAssetLastUpdated(new Date().toISOString());
      setAssetError("");
    };

    socket.on("connect", () => {
      setAssetSocketConnected(true);
      socket.emit("subscribe:assets", { source: "dashboard" });
      socket.emit("subscribe:coins", { source: "dashboard" });
      socket.emit("subscribe:prices", { source: "dashboard" });
    });

    socket.on("disconnect", () => {
      setAssetSocketConnected(false);
    });

    socket.on("connect_error", () => {
      setAssetSocketConnected(false);
      const freshToken = normalizeSocketToken(getStoredAccessToken());

      if (freshToken && socket.auth?.token !== freshToken) {
        socket.auth = { token: freshToken };
      }
    });

    socket.onAny((eventName, payload) => {
      if (MARKET_SOCKET_EVENT_PATTERN.test(eventName)) {
        mergeIncomingAssets(payload);
      }
    });

    return () => {
      socket.offAny();
      socket.removeAllListeners();
      socket.disconnect();
      setAssetSocketConnected(false);
    };
  }, []);

  useEffect(() => {
    if (!assetPriceStreamKey) {
      return undefined;
    }

    let closed = false;
    const socket = new WebSocket(
      `${MARKET_STREAM_BASE_URL}${assetPriceStreamKey}`,
    );

    socket.addEventListener("open", () => {
      if (!closed) setMarketStreamConnected(true);
    });

    socket.addEventListener("message", (event) => {
      let payload = null;

      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }

      const updates = getMarketStreamAssetUpdates(payload);
      if (!updates.length) return;

      setAssetCoins((currentAssets) =>
        mergeAssetUpdates(currentAssets, updates),
      );
      setAssetLastUpdated(new Date().toISOString());
      setAssetError("");
    });

    socket.addEventListener("close", () => {
      if (!closed) setMarketStreamConnected(false);
    });

    socket.addEventListener("error", () => {
      if (!closed) setMarketStreamConnected(false);
    });

    return () => {
      closed = true;
      setMarketStreamConnected(false);
      socket.close();
    };
  }, [assetPriceStreamKey]);

  if (loading) {
    return <Skeleton pageName="dashboard" />;
  }

  return (
    <div className="space-y-6 pb-4">
      <PageTopBanner
        title="Dashboard"
        description="Overview of your payment performance for the last 30 days"
        // actions={
        //   <>
        //     <DateFilter
        //       placeholder="Last 7 days"
        //       className="w-full text-theme-text sm:w-auto sm:min-w-[10rem]"
        //     />
        //     <Button
        //       value="Export Report"
        //       className="w-full bg-white text-theme-text sm:w-auto"
        //       icon={<DownloadIcon className="text-theme-text" size={20} />}
        //     />
        //     <Button
        //       value="Create Payment Link"
        //       className="w-full border-0 text-white sm:w-auto"
        //       variant="primary"
        //       icon={<PlusIcon />}
        //     />
        //   </>
        // }
      />
      {verificationStatus && (
        <div
          className={`flex flex-col gap-3 rounded-[18px] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${verificationStatus.wrapperClass}`}
        >
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-2 text-sm font-bold ${verificationStatus.textClass}`}
            >
              <VerificationIcon size={17} />
              {verificationStatus.label}
            </span>
            <p className="mt-1 text-sm leading-6 text-secondary-text">
              {verificationStatus.message}
            </p>
          </div>
          <Button
            value="Verify now"
            variant="primary"
            className="h-10 w-full shrink-0 border-0 px-4 text-sm text-white sm:w-auto"
            rightIcon={<ArrowUpRight size={16} />}
            onClick={() =>
              saveStoredSecurityActiveTab(SECURITY_TAB_VERIFICATION)
            }
            onNavigate={SECURITY_PAGE_HREF}
          />
        </div>
      )}
      <DashboardTopSection
        assets={dashboardAssets}
        assetLoading={marketLoading}
        assetError={assetError}
        socketConnected={livePriceConnected}
        lastUpdated={assetLastUpdated}
        apiKeyTotalDocs={apiKeyTotalDocs}
        totalUsdtBalance={totalUsdtBalance}
        totalDeposits={totalDeposits}
        totalWithdrawals={totalWithdrawals}
      />

      <section className="grid w-full min-w-0 items-start gap-6 overflow-hidden xl:grid-cols-2">
        {/* <RevenueTrendCard /> */}
        <TotalBalanceCard
          assets={dashboardAssets}
          totalUsdtBalance={totalUsdtBalance}
        />

        <Table
          className="min-w-0 overflow-hidden"
          title="Recent transactions"
          subtitle="Latest activity across all payment methods"
          search={false}
          // actions={<Button value="View All" />}
          columns={[
            { key: "transactionId", title: "Transaction ID" },
            { key: "customer", title: "Customer" },
            { key: "email", title: "Email" },
            { key: "method", title: "Method" },
            { key: "amount", title: "Amount" },
            { key: "status", title: "Status" },
            { key: "date", title: "Date" },
          ]}
          data={dashboardTransactions}
          loading={dashboardLoading}
          emptyMessage={dashboardError || "No recent transactions found."}
          pagination={
            dashboardPagination.total
              ? {
                  page: dashboardPagination.page,
                  totalPages: dashboardPagination.totalPages,
                  pageSize: dashboardPagination.limit,
                  totalItems: dashboardPagination.total,
                }
              : null
          }
          minWidth={1100}
        />
      </section>
    </div>
  );
}

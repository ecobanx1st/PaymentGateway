"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Bitcoin,
  Check,
  Copy,
  Download,
  Gem,
  Hexagon,
  Landmark,
  LoaderCircle,
  PiggyBank,
  ShieldCheck,
  CircleDollarSign,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ArrowUpRight,
  X,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Dropdown from "@/components/ui/dropdown";
import TabButton from "@/components/ui/TabButton";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Skeleton from "@/components/ui/skeleton";
import Snackbar from "@/components/ui/Snackbar";
import apiClient, {
  getApiErrorPayload,
  getApiErrorStatus,
  getStoredAccessToken,
} from "@/lib/axiosInterceptor";
import { createQrMatrix, drawQrToCanvas, qrMatrixToDataUrl } from "@/lib/qr-code";
import { resolveBackendMediaUrl } from "@/lib/user-profile";
import { useStoredUserVerification } from "@/lib/user-verification-storage";
import {
  saveStoredSecurityActiveTab,
  SECURITY_PAGE_HREF,
  SECURITY_TAB_TWO_FACTOR,
  SECURITY_TAB_VERIFICATION,
} from "@/lib/security-tab-storage";
import { getAccountBaseRoute } from "@/utils/accountRoutes";

const ASSET_TONES = [
  "#f7931a",
  "#9b5cff",
  "#0ea5e9",
  "#84cc16",
  "#14b8a6",
  "#fb7185",
  "#22c55e",
  "#eab308",
];

const ASSET_ICONS = {
  BTC: Bitcoin,
  ETH: Gem,
  USDC: CircleDollarSign,
  USDT: CircleDollarSign,
  BNB: Landmark,
  TRX: ShieldCheck,
  SOL: PiggyBank,
  XRP: Landmark,
};

const availableWithdrawBalance = 10000;
const WALLET_SECURITY_NAVIGATION_DELAY_MS = 2500;

function clampAmount(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseAmount(value) {
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getResponseMessage(payload) {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  if (typeof payload?.errors?.message === "string") {
    return payload.errors.message;
  }
  if (Array.isArray(payload?.errors)) {
    const firstMessage = payload.errors.find(
      (item) => typeof item === "string" || typeof item?.message === "string",
    );

    if (typeof firstMessage === "string") return firstMessage;
    if (typeof firstMessage?.message === "string") return firstMessage.message;
  }

  return "";
}

function getWalletVerificationGate(verification) {
  if (!verification?.blocked) return OPEN_VERIFICATION_GATE;

  const label = verification.label || "KYC";
  const details = verification.message || "";

  return {
    blocked: true,
    label,
    title: `Verify ${label}`,
    message: `Verify ${label} to use deposit and withdrawal features.`,
    details,
  };
}

const OPEN_VERIFICATION_GATE = {
  blocked: false,
  label: "KYC",
  title: "",
  message: "",
  details: "",
};

function getVerificationWordFromText(value, scanAsKey = false) {
  if (typeof value !== "string" || !value.trim()) return "";

  if (scanAsKey) {
    const normalized = value.toLowerCase();
    if (normalized.includes("kyc")) return "kyc";
    if (normalized.includes("kyb")) return "kyb";
    return "";
  }

  const match = value.match(/\b(kyc|kyb)\b/i);
  return match?.[1]?.toLowerCase() || "";
}

function getWalletApiVerificationKind(value, seen = new Set()) {
  const directMatch = getVerificationWordFromText(value);
  if (directMatch) return directMatch;

  if (!value || typeof value !== "object") return "";
  if (seen.has(value)) return "";
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const itemMatch = getWalletApiVerificationKind(item, seen);
      if (itemMatch) return itemMatch;
    }

    return "";
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const keyMatch = getVerificationWordFromText(key, true);
    if (keyMatch) return keyMatch;

    const nestedMatch = getWalletApiVerificationKind(nestedValue, seen);
    if (nestedMatch) return nestedMatch;
  }

  return "";
}

function hasWalletApiTwoFactorRequired(value, seen = new Set()) {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();

    return (
      (normalized.includes("two-factor") ||
        normalized.includes("two factor") ||
        normalized.includes("2fa")) &&
      (normalized.includes("must") ||
        normalized.includes("required") ||
        normalized.includes("enable") ||
        normalized.includes("enabled"))
    );
  }

  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => hasWalletApiTwoFactorRequired(item, seen));
  }

  return Object.values(value).some((item) =>
    hasWalletApiTwoFactorRequired(item, seen),
  );
}

async function fetchWalletResource(path, body = {}) {
  try {
    const response = await apiClient.post(path, body);

    return {
      response: {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
      },
      payload: response.data,
    };
  } catch (error) {
    return {
      response: {
        ok: false,
        status: getApiErrorStatus(error),
      },
      payload: getApiErrorPayload(error),
    };
  }
}

function findList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  for (const key of [
    "assets",
    "networks",
    "docs",
    "data",
    "result",
    "items",
    "list",
    "wallets",
  ]) {
    const list = findList(value[key]);
    if (list) return list;
  }

  return null;
}

function getAssetList(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.result,
    payload?.data?.result,
    payload?.result?.data,
  ];

  for (const candidate of candidates) {
    const list = findList(candidate);
    if (list) return list;
  }

  return [];
}

function pickString(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function pickAmount(source) {
  const amountKeys = [
    "free",
    "available",
    "availableBalance",
    "available_balance",
    "balance",
    "amount",
    "total",
  ];

  for (const key of amountKeys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return parseAmount(source[key]);
    }
  }

  return 0;
}

function getAssetSymbol(asset) {
  return (
    pickString(asset, [
      "assetSymbol",
      "symbol",
      "assets",
      "asset",
      "currency",
      "coin",
      "ticker",
      "code",
    ]) || "ASSET"
  ).toUpperCase();
}

function getAssetName(asset, symbol) {
  return (
    pickString(asset, [
      "assetName",
      "name",
      "assetFullName",
      "fullName",
      "currencyName",
    ]) || symbol
  );
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

  return networks
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
    .join(", ");
}
function formatAssetAmount(value, symbol) {
  const amount = parseAmount(value);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: amount === 0 ? 4 : 8,
  });

  return `${formatted} ${symbol}`.trim();
}

function getAssetImageUrl(asset) {
  return resolveBackendMediaUrl(
    pickString(asset, [
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
    ]),
  );
}

function createAssetCard(asset, index) {
  const symbol = getAssetSymbol(asset);
  const name = getAssetName(asset, symbol);
  const amount = pickAmount(asset);

  return {
    id: asset?._id || asset?.id || `${symbol}-${index}`,
    asset,
    label: "Available Balance",
    amount: formatAssetAmount(amount, symbol),
    symbol,
    name,
    networkLabel: getNetworkLabel(asset),
    icon: ASSET_ICONS[symbol] || CircleDollarSign,
    imageUrl: getAssetImageUrl(asset),
    tone: ASSET_TONES[index % ASSET_TONES.length],
    depositStatus: asset?.depositStatus !== false,
    withdrawStatus: asset?.withdrawStatus !== false,
  };
}

function createNetworkOption(network, index) {
  const networkRecord = getNetworkRecord(network);
  const symbol = pickString(networkRecord, [
    "networkSymbol",
    "symbol",
    "chainId",
    "type",
  ]);
  const name =
    pickString(networkRecord, ["networkName", "name", "label"]) ||
    symbol ||
    "Network";
  const chainId = pickString(networkRecord, ["chainId"]);
  const type = pickString(networkRecord, ["type"]);
  const depositEnabled = networkRecord?.depositEnabled === true;
  const withdrawEnabled = networkRecord?.withdrawEnabled === true;
  const detail = [symbol, chainId, type]
    .filter(Boolean)
    .filter((item, itemIndex, source) => source.indexOf(item) === itemIndex)
    .join(" - ");
  const fallbackValue = [symbol, chainId, type, name, index]
    .filter((item) => item !== undefined && item !== null && item !== "")
    .join("-");

  const label = symbol ? `${name} (${symbol})` : name;

return {
  label,
  value:
    network?._id ||
    network?.id ||
    networkRecord?._id ||
    networkRecord?.id ||
    fallbackValue,
  network,
  networkName: name,
  networkSymbol: symbol,
  withdrawFee: network?.withdrawFee,
  minWithdrawAmount: network?.minWithdrawAmount,
  contractAddress: network?.contractAddress || "",
  depositEnabled,
  withdrawEnabled,
};
}
function getNetworkSymbol(option) {
  if (!option) return "";
  if (typeof option === "string") return option.trim().toUpperCase();

  const networkRecord = getNetworkRecord(option.network || option);

  return (
    pickString(networkRecord, [
      "networkSymbol",
      "symbol",
      "chainId",
      "type",
      "code",
    ]) ||
    pickString(option, ["networkSymbol", "symbol", "chainId", "type", "value"])
  ).toUpperCase();
}

function getNetworkWithdrawSettings(option) {
  const network = option?.network || option || {};

  return {
    withdrawFee: network.withdrawFee ?? option?.withdrawFee,
    minWithdrawAmount: network.minWithdrawAmount ?? option?.minWithdrawAmount,
  };
}

function getNetworkContractAddress(option) {
  return pickString(option, ["contractAddress"]);
}

// function ContractAddressBlock({ contractAddress }) {
//   const [copiedContract, setCopiedContract] = useState(false);

//   if (!contractAddress) return null;

//   const copyContractAddress = async () => {
//     try {
//       await navigator.clipboard.writeText(contractAddress);
//       setCopiedContract(true);
//       window.setTimeout(() => setCopiedContract(false), 1400);
//     } catch {
//       setCopiedContract(false);
//     }
//   };

//   return (
//     <div className="overflow-hidden rounded-2xl border border-input-border bg-input-bg/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
//       <div className="flex items-center justify-between gap-3 border-b border-input-border/70 bg-primary-bg/60 px-4 py-2.5">
//         <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-secondary-text">
//           <Hexagon size={14} className="text-primary-text" />
//           Contract Address
//         </span>
//         <button
//           type="button"
//           onClick={copyContractAddress}
//           aria-label="Copy contract address"
//           className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-input-border bg-input-bg text-secondary-text transition hover:border-primary hover:text-primary"
//         >
//           {copiedContract ? <Check size={13} /> : <Copy size={13} />}
//         </button>
//       </div>
//       <div className="flex items-center gap-3 px-4 py-3">
//         <span className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-theme-text">
//           {contractAddress}
//         </span>
//         {copiedContract ? (
//           <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-text">
//             Copied
//           </span>
//         ) : null}
//       </div>
//     </div>
//   );
// }

function getWalletAddress(payload) {
  return pickString(payload?.data, ["address", "walletAddress", "depositAddress"]);
}

function getAssetNetworkItems(asset) {
  const assetNetworks = Array.isArray(asset?.networks)
    ? asset.networks
    : Array.isArray(asset?.networkIds)
      ? asset.networkIds
      : [];

  return assetNetworks.filter(
    (network) =>
      network &&
      network.networkId &&
      typeof network.networkId === "object"
  );
}
function AssetIconBadge({ imageUrl, icon: Icon, tone, name }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl && !imageFailed);

  return (
    <span
      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[26px] text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] "
      // style={{ backgroundColor: tone || "var(--primary)" }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Asset images come from backend uploads.
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-contain p-1.5 rounded-[26px]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Icon size={21} strokeWidth={2.25} />
      )}
    </span>
  );
}

function StatCard({
  label,
  amount,
  icon: Icon,
  imageUrl,
  tone,
  symbol,
  name,
  networkLabel,
  selected = false,
  onSelect,
}) {
  const cardBackground = selected
    ? `linear-gradient(145deg, color-mix(in srgb, ${tone} 18%, var(--cardbg)) 0%, var(--cardbg) 48%, color-mix(in srgb, var(--primary) 16%, var(--cardbg)) 100%)`
    : `linear-gradient(145deg, color-mix(in srgb, ${tone} 10%, var(--cardbg)) 0%, var(--cardbg) 56%, color-mix(in srgb, var(--primary) 8%, var(--cardbg)) 100%)`;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group relative flex min-h-[178px] overflow-hidden rounded-[20px] border p-4 text-left text-theme-text transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:p-5 ${
        selected
          ? "border-primary shadow-[0_22px_48px_rgba(75, 71, 255,0.26)]"
          : "border-input-border hover:border-primary/55 hover:shadow-[0_18px_42px_rgba(0,0,0,0.16)]"
      }`}
      style={{
        background: cardBackground,
      }}
    >
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AssetIconBadge imageUrl={imageUrl} icon={Icon} tone={tone} name={name} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-theme-text">
                {name}
              </span>
              <span className="mt-1 inline-flex rounded-full border border-input-border bg-primary-bg/45 px-2 py-0.5 text-[11px] font-bold uppercase text-primary-text">
                {symbol}
              </span>
            </span>
          </div>

          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
              selected
                ? "border-primary bg-primary text-white"
                : "border-input-border bg-primary-bg/45 text-secondary-text group-hover:border-primary group-hover:text-primary"
            }`}
          >
            {selected ? <Check size={15} strokeWidth={3} /> : <span className="h-2 w-2 rounded-full bg-current" />}
          </span>
        </div>

        <div className="mt-auto pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary-text">
            {label}
          </p>
          <p className="mt-2 truncate text-[1.65rem] font-bold leading-none text-theme-text sm:text-[1.85rem]">
            {amount}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="min-w-0 truncate rounded-full border border-input-border bg-primary-bg/45 px-3 py-1 text-xs font-semibold text-secondary-text">
              {networkLabel || name}
            </span>
            <span className="text-[11px] font-semibold uppercase text-secondary-text">
              Wallet
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function DepositQr({ address, loading, symbol }) {
  const qrValue = String(address || "").trim();
  const qrDataUrl = useMemo(() => {
    if (!qrValue) return "";

    try {
      return qrMatrixToDataUrl(createQrMatrix(qrValue), 6, 3);
    } catch {
      return "";
    }
  }, [qrValue]);

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      {loading ? (
        <LoaderCircle size={26} className="animate-spin text-primary" />
      ) : qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- QR SVG data URL is generated on the client.
        <img
          src={qrDataUrl}
          alt={`${symbol} deposit address QR code`}
          className="h-full w-full rounded-lg bg-white object-contain"
        />
      ) : (
        <span className="text-xs font-bold uppercase text-[#08080A]/60">QR</span>
      )}
    </div>
  );
}

function DepositPanel({
  selectedAsset,
  depositAddress,
  depositLoading,
  depositError,
  copied,
  onCopy,
  onDownloadQr,
  networkOptions,
  selectedNetwork,
  onNetworkChange,
  networkError,
}) {
  const symbol = selectedAsset?.symbol || "Coin";
  const contractAddress = getNetworkContractAddress(selectedNetwork);

  return (
    <section className="w-full max-w-2xl rounded-[18px] border border-input-border bg-primary-bg p-4 sm:p-6 lg:p-7">
      <h2 className="text-xl font-semibold text-theme-text sm:text-2xl">
        Deposit {symbol}
      </h2>

      {!networkOptions?.length ? (
        <div className="mt-6">
          <p className="text-sm text-secondary-text">
            No active networks available for this asset.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            <Input
              label={`${symbol} Deposit`}
              value={depositAddress}
              readOnly
              placeholder={depositLoading ? "Loading wallet address..." : "Wallet address"}
              inputClassName="rounded-full"
              rightElement={
                depositLoading ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary-text text-secondary-text">
                    <LoaderCircle size={15} className="animate-spin" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onCopy}
                    aria-label="Copy deposit address"
                    disabled={!depositAddress}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary-text text-secondary-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                )
              }
            />
            {depositError ? (
              <p className="text-xs text-red-400">{depositError}</p>
            ) : null}

            <Dropdown
              label="Network"
              placeholder="Network"
              value={selectedNetwork}
              onChange={onNetworkChange}
              options={networkOptions}
              searchable={false}
              clearable={false}
              className="gap-2 w-full rounded-full"
            />
            {networkError ? (
              <p className="text-xs text-red-400">{networkError}</p>
            ) : null}

            {/* <ContractAddressBlock contractAddress={contractAddress} /> */}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[auto,1fr] sm:items-center">
            <div className="flex items-center gap-4">
              <DepositQr
                address={depositAddress}
                loading={depositLoading}
                symbol={symbol}
              />
              <div className="space-y-2">
                <Button
                  value="Download"
                  size="sm"
                  rightIcon={<Download size={15} />}
                  disabled={!depositAddress || depositLoading}
                  onClick={onDownloadQr}
                />
              </div>
            </div>

            <div className="wallet-note rounded-2xl px-4 py-3 text-xs leading-5 text-[#e7ddbc] sm:text-sm">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(255,185,64,0.29)] text-[11px] text-[#f2c55a]">
                !
              </span>
              Note: Deposit may take from a few minutes to over 30 minutes.
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function WithdrawPanel({
  selectedAsset,
  networkOptions,
  selectedNetwork,
  onNetworkChange,
  networkError,
  submitting,
  onSubmit,
}) {
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdraw2faCode, setWithdraw2faCode] = useState("");
  const [amountError, setAmountError] = useState("");
  const symbol = selectedAsset?.symbol || "Coin";
  const { withdrawFee, minWithdrawAmount } = getNetworkWithdrawSettings(selectedNetwork);
  const contractAddress = getNetworkContractAddress(selectedNetwork);
  const minwithdrawAmount = minWithdrawAmount
  const withdrawFeeAmount = withdrawFee;
  const feePercent = Number(withdrawFeeAmount) || 0;
  const minRequiredAmount =
    Number(minwithdrawAmount) > 0 && feePercent < 100
      ? Number(minwithdrawAmount) / (1 - feePercent / 100)
      : Number(minwithdrawAmount) || 0;
  const clampedAmount = clampAmount(
    parseAmount(withdrawAmount),
    0,
    availableWithdrawBalance,
  );
  const isAmountBelowMin = clampedAmount > 0 && clampedAmount < minRequiredAmount;
  const availableBalance = pickAmount(selectedAsset?.asset);
  const hasNoBalance = !(availableBalance > 0);

  const handleAmountChange = (event) => {
    let raw = event.target.value.replace(/[^0-9.]/g, "");
    if (raw.split(".").length > 2) return;
    setWithdrawAmount(raw);

    const parsed = parseAmount(raw);
    const complete = raw !== "" && !raw.endsWith(".");
    if (complete && parsed > 0 && parsed < minRequiredAmount) {
      setAmountError(
        `Minimum net withdrawal amount is ${minwithdrawAmount} ${symbol}. With a ${feePercent}% fee, you need to withdraw at least ${minRequiredAmount}.`
      );
    } else {
      setAmountError("");
    }
  };

  const handleSubmit = () => {
    if (hasNoBalance) {
      setAmountError(
        `Insufficient balance. Available: ${availableBalance} ${symbol}.`
      );
      return;
    }
    if (isAmountBelowMin) {
      setAmountError(
        `Minimum net withdrawal amount is ${minwithdrawAmount} ${symbol}. With a ${feePercent}% fee, you need to withdraw at least ${minRequiredAmount}.`
      );
      return;
    }
    onSubmit?.({
      amount: clampedAmount,
      assetSymbol: symbol,
      networkSymbol: getNetworkSymbol(selectedNetwork),
      receiverAddress: withdrawAddress.trim(),
      withdraw2faCode: withdraw2faCode.trim(),
      minRequiredAmount,
    });
  };

  return (
    <section className="w-full max-w-2xl rounded-[18px] border border-input-border bg-primary-bg p-4 sm:p-6 lg:p-7">
       <h2 className="text-xl font-semibold text-theme-text sm:text-2xl">
         Withdraw {symbol}
       </h2>

       {!networkOptions?.length ? (
         <div className="mt-6">
           <p className="text-sm text-secondary-text">
             No active networks available for this asset.
           </p>
         </div>
       ) : (
         <div className="mt-6 space-y-4">
           <Input
             label="Withdraw Address"
             value={withdrawAddress}
             onChange={(event) => setWithdrawAddress(event.target.value)}
             placeholder="*******"
             inputClassName="rounded-full"
           />

           <Dropdown
             label="Withdraw Network"
             placeholder="Network"
             value={selectedNetwork}
             onChange={onNetworkChange}
             options={networkOptions}
             searchable={false}
             clearable={false}
             className="gap-2 w-full rounded-full"
           />
           {networkError ? (
             <p className="text-xs text-red-400">{networkError}</p>
           ) : null}

           {/* <ContractAddressBlock contractAddress={contractAddress} /> */}

           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-secondary-text">
               Withdraw Amount
             </label>
             <div className="flex h-11 items-center overflow-hidden rounded-full border border-input-border bg-input-bg transition-all duration-300 hover:bg-secondary-bg focus-within:border-theme-text">
               <span className="shrink-0 border-r border-input-border px-4 text-sm font-semibold text-secondary-text">
                 {symbol}
               </span>
<input
                   value={withdrawAmount}
                   onChange={handleAmountChange}
                   placeholder={minWithdrawAmount ? String(minWithdrawAmount) : "0"}
                   min={minWithdrawAmount ?? 0}
                   step="0.01"
                   className="min-w-0 flex-1 bg-transparent px-4 py-2 text-theme-text outline-none placeholder:text-secondary-text"
                 />
              </div>
              {amountError ? (
                <p className="text-xs text-red-400">{amountError}</p>
              ) : null}
            </div>

<div className="flex items-center justify-between gap-3">
              <p className="text-sm text-secondary-text">
                Min Withdraw:{" "}
                <span className="text-primary-text">{(minwithdrawAmount)}</span>
              </p>
              <p className="text-sm text-secondary-text">
                Withdraw Fee:{" "}
                <span className="text-primary-text">{withdrawFeeAmount}%</span>
              </p>
            </div>
            {clampedAmount > 0 ? (
              <p className="text-sm text-secondary-text">
                You Receive:{" "}
                <span className="font-semibold text-primary">
                  {clampedAmount - (clampedAmount * feePercent) / 100} {symbol}
                </span>
              </p>
            ) : null}

           <Input
             label="2FA Verification Code"
             value={withdraw2faCode}
             onChange={(event) =>
               setWithdraw2faCode(event.target.value.replace(/\D/g, "").slice(0, 6))
             }
             placeholder="123456"
             inputClassName="rounded-full"
           />
           <p className="text-sm text-secondary-text">
             Enter the 6-digit code from your authenticator app.
           </p>

            <Button
              value={submitting ? "Submitting..." : `Submit ${symbol} Withdraw`}
              variant="primary"
              disabled={!selectedAsset?.withdrawStatus || submitting || isAmountBelowMin || hasNoBalance}
              className="w-full text-white"
              onClick={handleSubmit}
            />
         </div>
       )}
    </section>
  );
}

function TransactionDrawer({
  open,
  selectedAsset,
  activeTab,
  onTabChange,
  onClose,
  depositAddress,
  depositLoading,
  depositError,
  copied,
  onCopy,
  onDownloadQr,
  networkOptions,
  depositNetworkOptions,
  depositNetworkError,
  depositNetwork,
  onDepositNetworkChange,
  withdrawNetworkOptions,
  withdrawNetworkError,
  withdrawNetwork,
  onWithdrawNetworkChange,
  withdrawSubmitting,
  onSubmitWithdraw,
  networkError,
  verificationGate = OPEN_VERIFICATION_GATE,
  hideTransactionTabs = false,
}) {
  const SelectedAssetIcon = selectedAsset?.icon || CircleDollarSign;
  const [isInlinePanel, setIsInlinePanel] = useState(false);
  const panelOpen = Boolean(open && selectedAsset);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const syncPanelMode = () => setIsInlinePanel(mediaQuery.matches);

    syncPanelMode();
    mediaQuery.addEventListener("change", syncPanelMode);

    return () => mediaQuery.removeEventListener("change", syncPanelMode);
  }, []);

  useEffect(() => {
    if (!panelOpen || isInlinePanel) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [panelOpen, isInlinePanel]);

  const renderPanelContent = (titleId) => (
    <>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-input-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <AssetIconBadge
            imageUrl={selectedAsset?.imageUrl}
            icon={SelectedAssetIcon}
            tone={selectedAsset?.tone || "var(--primary)"}
            name={selectedAsset?.name || "Wallet transaction"}
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-secondary-text">
              {selectedAsset?.symbol || "Coin"}
            </p>
            <h2
              id={titleId}
              className="mt-1 truncate text-xl font-semibold text-theme-text"
            >
              {selectedAsset?.name || "Wallet transaction"}
            </h2>
            {selectedAsset?.amount ? (
              <p className="mt-1 truncate text-xs text-secondary-text">
                {selectedAsset.amount}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-input-border text-secondary-text transition hover:border-primary hover:text-primary"
          aria-label="Close wallet transaction panel"
        >
          <X size={16} />
        </button>
      </div>

      <div
        data-lenis-prevent="true"
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {selectedAsset ? (
          <div className="space-y-5">
            {!hideTransactionTabs ? (
              <div role="tablist" className="flex gap-3">
                <TabButton
                  value="Deposit"
                  selected={activeTab === "deposit"}
                  className="flex-1"
                  disabled={!selectedAsset.depositStatus}
                  icon={ArrowUp}
                  iconSize={18}
                  onClick={() => onTabChange("deposit")}
                />
                <TabButton
                  value="Withdraw"
                  selected={activeTab === "withdraw"}
                  className="flex-1"
                  disabled={!selectedAsset.withdrawStatus}
                  rightIcon={ArrowDown}
                  iconSize={18}
                  onClick={() => onTabChange("withdraw")}
                />
              </div>
            ) : null}

            <div className="relative">
              <div
                className={`transition duration-200 ${
                  verificationGate.blocked
                    ? "pointer-events-none select-none blur-[2px] opacity-45"
                    : ""
                }`}
                aria-hidden={verificationGate.blocked}
              >
                {activeTab === "withdraw" ? (
                  <WithdrawPanel
                    selectedAsset={selectedAsset}
                    networkOptions={withdrawNetworkOptions}
                    selectedNetwork={withdrawNetwork}
                    onNetworkChange={onWithdrawNetworkChange}
                    networkError={withdrawNetworkError}
                    submitting={withdrawSubmitting}
                    onSubmit={onSubmitWithdraw}
                  />
                ) : (
                  <DepositPanel
                    selectedAsset={selectedAsset}
                    depositAddress={depositAddress}
                    depositLoading={depositLoading}
                    depositError={depositError}
                    copied={copied}
                    onCopy={onCopy}
                    onDownloadQr={onDownloadQr}
                    networkOptions={depositNetworkOptions}
                    selectedNetwork={depositNetwork}
                    onNetworkChange={onDepositNetworkChange}
                    networkError={depositNetworkError}
                  />
                )}
              </div>

              {verificationGate.blocked ? (
                <div className="absolute inset-0 z-10 flex items-start justify-center rounded-[18px] bg-primary-bg/55 p-4 backdrop-blur-[1px] sm:items-center">
                  <div className="max-w-sm rounded-[18px] border border-amber-400/35 bg-amber-400/10 p-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
                      <AlertTriangle size={22} />
                    </span>
                    <h3 className="mt-3 text-base font-bold text-theme-text">
                      {verificationGate.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-secondary-text">
                      {verificationGate.message}
                    </p>
                    <Button
                      value="Verify now"
                      variant="primary"
                      className="mx-auto mt-4 h-10 border-0 px-4 text-sm text-white"
                      rightIcon={<ArrowUpRight size={16} />}
                      onClick={() =>
                        saveStoredSecurityActiveTab(SECURITY_TAB_VERIFICATION)
                      }
                      onNavigate={SECURITY_PAGE_HREF}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] transition xl:hidden ${panelOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!panelOpen}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-[var(--shell-overlay)] backdrop-blur-sm transition-opacity duration-300 ease-out ${
            panelOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-transaction-title"
          className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-input-border bg-primary-bg shadow-[0_24px_90px_rgba(0,0,0,0.34)] transition-transform duration-300 ease-out will-change-transform ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {renderPanelContent("wallet-transaction-title")}
        </aside>
      </div>

      <aside
        aria-hidden={!panelOpen}
        aria-labelledby="wallet-transaction-inline-title"
        className={`relative z-0 hidden h-full min-h-0 shrink-0 overflow-hidden border-l bg-primary-bg/80 shadow-[inset_1px_0_0_rgba(75, 71, 255,0.12)] transition-[width,opacity,transform,border-color] duration-300 ease-out xl:flex xl:flex-col ${
          panelOpen
            ? "w-[420px] translate-x-0 border-input-border opacity-100 2xl:w-[560px]"
            : "w-0 translate-x-6 border-transparent opacity-0 pointer-events-none"
        }`}
      >
        {panelOpen ? renderPanelContent("wallet-transaction-inline-title") : null}
      </aside>
    </>
  );
}

export default function Page() {
  const router = useRouter();
  const securityNavigationTimerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [assetError, setAssetError] = useState("");
  const [depositNetwork, setDepositNetwork] = useState(null);
  const [withdrawNetwork, setWithdrawNetwork] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assetSymbol, setAssetSymbol] = useState("");
  const [networkSymbol, setNetworkSymbol] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const baseRoute=getAccountBaseRoute();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    tone: "success",
  });
  const verification = useStoredUserVerification();
  const verificationGate = useMemo(
    () => getWalletVerificationGate(verification),
    [verification],
  );
  const hideTransactionTabs =
    verification.kind === "kyc" && !verification.approved;
  const balanceCards = useMemo(
    () => assets.map((asset, index) => createAssetCard(asset, index)),
    [assets],
  );
  const selectedAsset = useMemo(
    () => balanceCards.find((asset) => asset.id === selectedAssetId) || null,
    [balanceCards, selectedAssetId],
  );
  const selectedNetworkOptions = useMemo(() => {
    if (!selectedAsset) return [];

    return getAssetNetworkItems(selectedAsset.asset)
      .map((network, index) => createNetworkOption(network, index));
  }, [selectedAsset]);

  const depositNetworkOptions = useMemo(() => {
    if (!selectedAsset) return [];

    return getAssetNetworkItems(selectedAsset.asset)
      .map((network, index) => createNetworkOption(network, index))
      .filter((option) => option.depositEnabled);
  }, [selectedAsset]);

  const withdrawNetworkOptions = useMemo(() => {
    if (!selectedAsset) return [];

    return getAssetNetworkItems(selectedAsset.asset)
      .map((network, index) => createNetworkOption(network, index))
      .filter((option) => option.withdrawEnabled);
  }, [selectedAsset]);

  const networkError =
    selectedAsset && !selectedNetworkOptions.length
      ? "No networks available for this asset."
      : "";

  const depositNetworkError =
    selectedAsset && !depositNetworkOptions.length
      ? "Deposit is disabled for all networks of this asset."
      : "";

  const withdrawNetworkError =
    selectedAsset && !withdrawNetworkOptions.length
      ? "Withdraw is disabled for all networks of this asset."
      : "";

  const scheduleSecurityNavigation = useCallback(
    (tabKey) => {
      saveStoredSecurityActiveTab(tabKey);

      if (securityNavigationTimerRef.current) {
        window.clearTimeout(securityNavigationTimerRef.current);
      }

      securityNavigationTimerRef.current = window.setTimeout(() => {
        securityNavigationTimerRef.current = null;
        router.push(SECURITY_PAGE_HREF);
      }, WALLET_SECURITY_NAVIGATION_DELAY_MS);
    },
    [router],
  );

  const navigateToKycVerification = useCallback(() => {
    scheduleSecurityNavigation(SECURITY_TAB_VERIFICATION);
  }, [scheduleSecurityNavigation]);

  const navigateToTwoFactorSecurity = useCallback(() => {
    scheduleSecurityNavigation(SECURITY_TAB_TWO_FACTOR);
  }, [scheduleSecurityNavigation]);

  useEffect(() => {
    return () => {
      if (securityNavigationTimerRef.current) {
        window.clearTimeout(securityNavigationTimerRef.current);
      }
    };
  }, []);

  const handleWalletApiSecurityResponse = useCallback(
    (payload) => {
      if (hasWalletApiTwoFactorRequired(payload)) {
        navigateToTwoFactorSecurity();
        return true;
      }

      if (!getWalletApiVerificationKind(payload)) return false;

      navigateToKycVerification();
      return true;
    },
    [navigateToKycVerification, navigateToTwoFactorSecurity],
  );

  useEffect(() => {
    let cancelled = false;

    const loadWalletData = async () => {
      setLoading(true);
      setAssetError("");

      const token = getStoredAccessToken();

      if (!token) {
        if (!cancelled) {
          setAssets([]);
          setAssetError("Login token is missing. Please sign in again.");
          setLoading(false);
        }
        return;
      }

      try {
        const assetResult = await fetchWalletResource(`${baseRoute}/asset/list`);
        const assetMessage = getResponseMessage(assetResult.payload);

        if (handleWalletApiSecurityResponse(assetResult.payload)) {
          if (!cancelled) {
            setAssets([]);
            setAssetError("");
          }
          return;
        }

        if (!assetResult.response.ok || assetResult.payload?.success === false) {
          if (!cancelled) {
            setAssets([]);
            setAssetError(assetMessage || "Could not load available assets.");
          }
        } else if (!cancelled) {
          setAssets(getAssetList(assetResult.payload));
          setAssetError("");
        }
      } catch (error) {
        if (!cancelled) {
          setAssets([]);
          setAssetError(
            error instanceof Error && error.message
              ? error.message
              : "Could not load available assets.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadWalletData();

    return () => {
      cancelled = true;
    };
  }, [handleWalletApiSecurityResponse]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      if (!depositNetworkOptions.length) {
        setDepositNetwork(null);
      } else {
        const nextDepositNetwork =
          depositNetwork && depositNetworkOptions.some((item) => item.value === depositNetwork.value)
            ? depositNetwork
            : depositNetworkOptions[0];
        setDepositNetwork(nextDepositNetwork);
        setNetworkSymbol(getNetworkSymbol(nextDepositNetwork));
      }

      if (!withdrawNetworkOptions.length) {
        setWithdrawNetwork(null);
        return;
      }

      const nextWithdrawNetwork =
        withdrawNetwork && withdrawNetworkOptions.some((item) => item.value === withdrawNetwork.value)
          ? withdrawNetwork
          : withdrawNetworkOptions[0];
      setWithdrawNetwork(nextWithdrawNetwork);
    });

    return () => {
      cancelled = true;
    };
  }, [depositNetwork, depositNetworkOptions, withdrawNetwork, withdrawNetworkOptions]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      if (!selectedAssetId) return;
      if (balanceCards.some((asset) => asset.id === selectedAssetId)) return;

      setSelectedAssetId("");
    });

    return () => {
      cancelled = true;
    };
  }, [balanceCards, selectedAssetId]);


  useEffect(() => {
    let cancelled = false;

    const createDepositWallet = async () => {
      if (!drawerOpen || !assetSymbol || !networkSymbol || verificationGate.blocked) {
        setDepositAddress("");
        setDepositError("");
        setDepositLoading(false);
        return;
      }

      setDepositLoading(true);
      setDepositError("");
      setDepositAddress("");

      try {
        const response = await apiClient.post(`${baseRoute}/wallet/create`, {
          assetSymbol,
          networkSymbol,
        });

        if (cancelled) return;

        if (handleWalletApiSecurityResponse(response.data)) {
          setDepositAddress("");
          setDepositError("");
          return;
        }

        const address = getWalletAddress(response.data);

        if (response.data?.success === false || !address) {
          setDepositError(
            getResponseMessage(response.data) || "Could not load deposit address.",
          );
          setDepositAddress("");
          return;
        }

        setDepositAddress(address);
      } catch (error) {
        if (cancelled) return;

        const payload = getApiErrorPayload(error);
        if (handleWalletApiSecurityResponse(payload)) {
          setDepositAddress("");
          setDepositError("");
          return;
        }

        setDepositAddress("");
        setDepositError(
          getResponseMessage(payload) || "Could not load deposit address.",
        );
      } finally {
        if (!cancelled) setDepositLoading(false);
      }
    };

    createDepositWallet();

    return () => {
      cancelled = true;
    };
  }, [
    assetSymbol,
    drawerOpen,
    handleWalletApiSecurityResponse,
    networkSymbol,
    verificationGate.blocked,
  ]);

  const selectAsset = (asset) => {
    setSelectedAssetId(asset.id);
    setAssetSymbol(asset.symbol);
    setDepositNetwork(null);
    setWithdrawNetwork(null);
    setNetworkSymbol("");
    setActiveTab(asset.depositStatus ? "deposit" : "withdraw");
    setDrawerOpen(true);
  };

  const changeDepositNetwork = (option) => {
    setDepositNetwork(option);
    setNetworkSymbol(getNetworkSymbol(option));
  };

  const copyAddress = async () => {
    if (!depositAddress) return;

    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const downloadDepositQr = () => {
    if (!depositAddress) return;

    try {
      const matrix = createQrMatrix(depositAddress);
      const canvas = document.createElement("canvas");
      drawQrToCanvas(canvas, matrix, 12, 4);
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${assetSymbol || "asset"}-${networkSymbol || "network"}-deposit-qr.png`;
        anchor.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      setDepositError("Could not generate deposit QR code.");
    }
  };

  useEffect(() => {
    if (!copied) return undefined;

    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const showSnackbar = (message, tone = "success") => {
    setSnackbar({ open: true, message, tone });
  };

  const submitWithdraw = async ({
    amount,
    assetSymbol,
    networkSymbol: selectedWithdrawNetworkSymbol,
    receiverAddress,
    withdraw2faCode,
    minRequiredAmount,
  }) => {
    if (withdrawSubmitting) return false;

    if (verificationGate.blocked) {
      showSnackbar(verificationGate.message || `Verify ${verificationGate.label} to continue.`, "error");
      return false;
    }

    if (!selectedAsset?.withdrawStatus) {
      showSnackbar("Withdrawals are disabled for this asset.", "error");
      return false;
    }

    if (!assetSymbol) {
      showSnackbar("Select an asset before submitting a withdrawal.", "error");
      return false;
    }

    if (!selectedWithdrawNetworkSymbol) {
      showSnackbar("Select a withdrawal network.", "error");
      return false;
    }

    if (!receiverAddress) {
      showSnackbar("Enter a withdrawal address.", "error");
      return false;
    }

    if (
      Number.isFinite(amount) &&
      Number.isFinite(minRequiredAmount) &&
      amount > 0 &&
      amount < minRequiredAmount
    ) {
      showSnackbar(
        `Minimum withdrawal amount is ${minRequiredAmount}.`,
        "error"
      );
      return false;
    }

    // if (!Number.isFinite(amount) || amount < 0.01) {
    //   showSnackbar("Withdrawal amount must be at least 0.01.", "error");
    //   return false;
    // }

    // if (Math.round(amount * 100) / 100 !== amount) {
    //   showSnackbar(
    //     "Withdrawal amount can have a maximum of 2 decimal places.",
    //     "error"
    //   );
    //   return false;
    // }

    if (!withdraw2faCode) {
      showSnackbar("Enter your 6-digit 2FA code.", "error");
      return false;
    }

    if (!/^\d{6}$/.test(withdraw2faCode)) {
      showSnackbar("Enter a valid 6-digit 2FA code.", "error");
      return false;
    }

    setWithdrawSubmitting(true);

    try {
      const response = await apiClient.post(`${baseRoute}/withdraw`, {
        assetSymbol,
        networkSymbol: selectedWithdrawNetworkSymbol,
        amount,
        receiverAddress,
        withdraw2faCode,
      });
      const message =
        getResponseMessage(response.data) ||
        "Withdrawal request submitted successfully.";

      if (response.data?.success === false) {
        showSnackbar(message, "error");
        handleWalletApiSecurityResponse(response.data);
        return false;
      }

      showSnackbar(message, "success");

      try {
        const assetResult = await fetchWalletResource(`${baseRoute}/asset/list`);
        handleWalletApiSecurityResponse(assetResult.payload);

        if (assetResult.response.ok && assetResult.payload?.success) {
          setAssets(getAssetList(assetResult.payload));
        }
      } catch {
        // ignore asset refresh error
      }

      setDrawerOpen(false);
      return true;
    } catch (error) {
      const payload = getApiErrorPayload(error);
      const message =
        getResponseMessage(payload) || "Could not submit withdrawal request.";
      showSnackbar(message, "error");
      handleWalletApiSecurityResponse(payload);
      return false;
    } finally {
      setWithdrawSubmitting(false);
    }
  };


  if (loading) {
    return <Skeleton pageName="wallet" />;
  }
  return (
    <section className="flex min-h-full flex-col xl:h-full xl:min-h-0 xl:flex-row xl:gap-6 xl:overflow-hidden">
      <div className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1">
        <PageTopBanner
          title="My Wallet"
          description="Manage balances, settlements, and withdrawals."
          className="shrink-0"
        />
        <div className="mt-8 min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-theme-text">
                Select Coin
              </h2>
              {selectedAsset ? (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-text">
                  {selectedAsset.symbol} selected
                </span>
              ) : null}
            </div>

            <div
              className={`grid w-full grid-cols-1 gap-4 transition-[grid-template-columns] duration-300 sm:grid-cols-3 2xl:gap-6 ${
                drawerOpen && selectedAsset
                  ? "xl:grid-cols-2 2xl:grid-cols-3"
                  : "2xl:grid-cols-4"
              }`}
            >
              {assetError ? (
                <div className="col-span-full rounded-2xl border border-input-border bg-primary-bg px-4 py-5 text-sm text-secondary-text">
                  {assetError}
                </div>
              ) : balanceCards.length > 0 ? (
                balanceCards.map((item) => (
                  <StatCard
                    key={item.id}
                    {...item}
                    selected={selectedAssetId === item.id}
                    onSelect={() => selectAsset(item)}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-input-border bg-primary-bg px-4 py-5 text-sm text-secondary-text">
                  No available assets found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionDrawer
        open={drawerOpen}
        selectedAsset={selectedAsset}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={() => setDrawerOpen(false)}
        depositAddress={depositAddress}
        depositLoading={depositLoading}
        depositError={depositError}
        copied={copied}
        onCopy={copyAddress}
        onDownloadQr={downloadDepositQr}
        networkOptions={selectedNetworkOptions}
        depositNetworkOptions={depositNetworkOptions}
        depositNetworkError={depositNetworkError}
        depositNetwork={depositNetwork}
        onDepositNetworkChange={changeDepositNetwork}
        withdrawNetworkOptions={withdrawNetworkOptions}
        withdrawNetworkError={withdrawNetworkError}
        withdrawNetwork={withdrawNetwork}
        onWithdrawNetworkChange={setWithdrawNetwork}
        withdrawSubmitting={withdrawSubmitting}
        onSubmitWithdraw={submitWithdraw}
        networkError={networkError}
        verificationGate={verificationGate}
        hideTransactionTabs={hideTransactionTabs}
      />
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </section>
  );
}

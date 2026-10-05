"use client";

import { Button, Input, Toast } from "@/components/ReusableUi";
import { getWithTokenApi, postWithTokenApi } from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import {
  Ban,
  CalendarDays,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  ShieldOff,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";


function getInitials(email = "") {
  return email.slice(0, 2).toUpperCase() || "AD";
}

function getApiErrorMessage(error, fallbackMessage) {
  const data = error.response?.data;

  return data?.message || data?.msg || data?.error || data?.errors?.msg || fallbackMessage;
}

function getUpdatedAdmin(response, fallbackAccount, phone) {
  const admin = response?.admin || response?.result?.admin || response?.data?.admin;
  const nextAdmin = Array.isArray(admin) ? admin[0] : admin;

  return nextAdmin || { ...fallbackAccount, phone };
}

function LockedField({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[8px] border border-input-border/30 bg-bg-secondary px-4 py-3 cursor-not-allowed">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-small text-text-secondary">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <Ban className="h-4 w-4 text-text-secondary" />
      </div>
      <p className="break-words text-mid font-semibold text-theme-text">{value || "-"}</p>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-input-border/20 bg-bg-secondary px-4 py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-input-bg text-text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-small text-text-secondary">{label}</p>
        <p className="mt-1 break-words text-mid font-semibold text-theme-text">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [passwordPayload, setPasswordPayload] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  function updatePasswordField(field, value) {
    setPasswordPayload((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: "" }));
  }

  function startPhoneEdit() {
    setPhoneDraft(account?.phone || "");
    setPhoneError("");
    setEditingPhone(true);
  }

  function cancelPhoneEdit() {
    setPhoneDraft(account?.phone || "");
    setPhoneError("");
    setEditingPhone(false);
  }

  async function fetchAccountDetails({ showSuccessToast = false } = {}) {
    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getWithTokenApi(token, "/details");
      const admin = Array.isArray(response?.admin) ? response.admin[0] : response?.admin;

      setAccount(admin || null);
      setPhoneDraft(admin?.phone || "");


      if (!admin) {
        setToast({ id: Date.now(), content: "Account details not found", color: "warning" });
      }
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to load account details."),
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDetails() {
    const phone = phoneDraft.trim();

    if (!phone) {
      setPhoneError("Phone number is required.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      return;
    }

    setUpdatingDetails(true);

    try {
      const response = await postWithTokenApi(token, "/update-details", { phone });
      const updatedAdmin = getUpdatedAdmin(response, account, phone);

      setAccount(updatedAdmin);
      setPhoneDraft(updatedAdmin?.phone || phone);
      setEditingPhone(false);
      setToast({
        id: Date.now(),
        content: response?.message || "Account details updated successfully",
        color: "success",
      });
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to update account details."),
        color: "error",
      });
    } finally {
      setUpdatingDetails(false);
    }
  }

  function validatePasswordPayload() {
    const nextErrors = {};
    const oldPassword = passwordPayload.oldPassword.trim();
    const newPassword = passwordPayload.newPassword.trim();
    const confirmPassword = passwordPayload.confirmPassword.trim();

    if (!oldPassword) {
      nextErrors.oldPassword = "Old password is required.";
    }

    if (!newPassword) {
      nextErrors.newPassword = "New password is required.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm password is required.";
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      nextErrors.newPassword = "Old and new password must not be same.";
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Confirm password must match new password.";
    }

    setPasswordErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    if (!validatePasswordPayload()) {
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({ id: Date.now(), content: "Session token not found", color: "error" });
      return;
    }

    setChangingPassword(true);

    try {
      const response = await postWithTokenApi(token, "/change-password", passwordPayload);

      setPasswordPayload({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setToast({
        id: Date.now(),
        content: response?.message || "Password changed successfully",
        color: "success",
      });
    } catch (error) {
      setToast({
        id: Date.now(),
        content: getApiErrorMessage(error, "Unable to change password."),
        color: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAccountDetails({ showSuccessToast: true });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color}
            duration={2500}
          />
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">Account</h1>
          <p className="text-small text-text-secondary">View your admin profile and security status.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchAccountDetails({ showSuccessToast: true })}
          disabled={loading}
          beforeIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          className="w-full sm:w-auto"
        >
          Refresh
        </Button>
      </section>

      <section className="max-w-5xl overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg">
        <div className="border-b border-input-border/30 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full [background:var(--button-primary)] text-large font-semibold text-white">
                {loading ? <UserRound className="h-7 w-7" /> : getInitials(account?.email)}
              </div>
              <div className="min-w-0">
                <p className="text-small uppercase text-text-secondary">Signed in as</p>
                <h2 className="mt-1 truncate text-large font-semibold text-theme-text">
                  {loading ? "Loading account..." : account?.email || "Unknown admin"}
                </h2>
                <p className="mt-1 text-small capitalize text-text-secondary">{account?.role || "admin"}</p>
              </div>
            </div>

            {!loading && account && (
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-small font-semibold ${
                  account.twoFactorEnabled
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {account.twoFactorEnabled ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <ShieldOff className="h-4 w-4" />
                )}
                2FA {account.twoFactorEnabled ? "Enabled" : "Disabled"}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center px-5 py-10 text-small text-text-secondary">
            Loading account details...
          </div>
        ) : account ? (
          <div className="space-y-5 px-5 py-6 sm:px-7">
            <div className="grid gap-4 md:grid-cols-2">
              <LockedField icon={Mail} label="Email address" value={account.email} />
              <LockedField icon={ShieldCheck} label="Role" value={account.role} />
            </div>

            <div className="rounded-[8px] border border-input-border/30 bg-bg-secondary px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-small text-text-secondary">
                  <Phone className="h-4 w-4" />
                  <span>Phone number</span>
                </div>
                {!editingPhone && (
                  <button
                    type="button"
                    aria-label="Edit phone number"
                    onClick={startPhoneEdit}
                    className="grid h-8 w-8 place-items-center rounded-full text-text-secondary transition hover:bg-input-bg hover:text-theme-text"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {editingPhone ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <Input
                      id="phone"
                      value={phoneDraft}
                      placeholder="Enter phone number"
                      disabled={updatingDetails}
                      inputClassName="!h-10"
                      onChange={(event) => {
                        setPhoneDraft(event.target.value);
                        setPhoneError("");
                      }}
                      aria-invalid={Boolean(phoneError)}
                    />
                    {phoneError && <p className="mt-2 text-small text-red-400">{phoneError}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      aria-label="Save phone number"
                      onClick={handleUpdateDetails}
                      disabled={updatingDetails}
                      className="!h-10 !w-10 !p-0"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      aria-label="Cancel phone edit"
                      onClick={cancelPhoneEdit}
                      disabled={updatingDetails}
                      className="!h-10 !w-10 !p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="break-words text-mid font-semibold text-theme-text">{account.phone || "-"}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem icon={CalendarDays} label="Created at" value={formatApiDate(account.createdAt)} />
              <InfoItem icon={CalendarDays} label="Last updated" value={formatApiDate(account.updatedAt)} />
            </div>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center px-5 py-10 text-small text-text-secondary">
            Account details not found.
          </div>
        )}
      </section>

      <section className="max-w-5xl rounded-rounded border border-input-border/40 bg-card-bg px-5 py-6 sm:px-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-input-bg text-text-primary">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-large font-semibold text-theme-text">Reset password</h2>
            <p className="text-small text-text-secondary">Change the password used for this admin account.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="grid gap-4 lg:grid-cols-3" noValidate>
          <div>
            <Input
              id="oldPassword"
              label="Old password"
              type="password"
              value={passwordPayload.oldPassword}
              placeholder="Enter old password"
              disabled={changingPassword}
              onChange={(event) => updatePasswordField("oldPassword", event.target.value)}
              aria-invalid={Boolean(passwordErrors.oldPassword)}
            />
            {passwordErrors.oldPassword && (
              <p className="mt-2 text-small text-red-400">{passwordErrors.oldPassword}</p>
            )}
          </div>

          <div>
            <Input
              id="newPassword"
              label="New password"
              type="password"
              value={passwordPayload.newPassword}
              placeholder="Enter new password"
              disabled={changingPassword}
              onChange={(event) => updatePasswordField("newPassword", event.target.value)}
              aria-invalid={Boolean(passwordErrors.newPassword)}
            />
            {passwordErrors.newPassword && (
              <p className="mt-2 text-small text-red-400">{passwordErrors.newPassword}</p>
            )}
          </div>

          <div>
            <Input
              id="confirmPassword"
              label="Confirm password"
              type="password"
              value={passwordPayload.confirmPassword}
              placeholder="Confirm new password"
              disabled={changingPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
              aria-invalid={Boolean(passwordErrors.confirmPassword)}
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-2 text-small text-red-400">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="lg:col-span-3 lg:flex lg:justify-end">
            <Button type="submit" variant="primary" disabled={changingPassword} className="w-full lg:w-44">
              {changingPassword ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}




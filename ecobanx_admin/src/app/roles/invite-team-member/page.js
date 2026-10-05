"use client";

import { Button, Dropdown, Input, Toast } from "@/components/ReusableUi";
import { useRouter } from "next/navigation";
import { useState } from "react";

const teamOptions = [
  { label: "Compliance", value: "compliance" },
  { label: "Support", value: "support" },
  { label: "Finance", value: "finance" },
  { label: "Operations", value: "operations" },
];

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Finance Team", value: "finance-team" },
  { label: "Support Team", value: "support-team" },
  { label: "Compliance Team", value: "compliance-team" },
];

const accessOptions = [
  { label: "Full Access", value: "full" },
  { label: "Restricted Access", value: "restricted" },
  { label: "View Only", value: "view" },
];

function AccessOption({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(option.value)}
      className="flex items-center gap-3 rounded-full py-1 pr-5 text-mid text-text-secondary transition hover:text-theme-text"
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border transition ${
          selected ? "border-text-primary bg-text-primary/15" : "border-input-border bg-input-bg"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-text-primary" />}
      </span>
      {option.label}
    </button>
  );
}

export default function InviteTeamMemberPage() {
  const router = useRouter();
  const [team, setTeam] = useState("");
  const [primaryRole, setPrimaryRole] = useState("");
  const [secondaryRole, setSecondaryRole] = useState("");
  const [access, setAccess] = useState("full");
  const [toast, setToast] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    setToast({ id: Date.now(), content: "Invitation sent successfully" });
    window.setTimeout(() => router.push("/roles"), 700);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast key={toast.id} content={toast.content} color="success" duration={2500} />
        </div>
      )}
      <section className="space-y-2">
        <h1 className="text-large font-semibold text-theme-text">Invite Team Member</h1>
        <p className="text-small text-text-secondary">Manage Admin Access Across Teams</p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-7 lg:p-8"
      >
        <h2 className="text-large font-semibold text-theme-text">Member Information</h2>

        <div className="mt-7 grid gap-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-7">
          <Input label="Full Name" placeholder="Enter full name" />
          <Input label="Email Address" type="email" placeholder="Enter work email address" />
          <Input label="Phone Number (Optional)" placeholder="Enter phone number" />
          <Dropdown
            label="Team"
            options={teamOptions}
            value={team}
            placeholder="Select team"
            onChange={setTeam}
          />
          <Dropdown
            label="Role"
            options={roleOptions}
            value={primaryRole}
            placeholder="Select role"
            onChange={setPrimaryRole}
          />
          <Input
            label="Invitation Message (Optional)"
            placeholder="Add a personal message to the invitation email..."
          />
          <Dropdown
            label="Role"
            options={roleOptions}
            value={secondaryRole}
            placeholder="Select role"
            onChange={setSecondaryRole}
          />
          <Input
            label="Invitation Message (Optional)"
            placeholder="Add a personal message to the invitation email..."
          />
        </div>

        <div className="mt-8">
          <p className="mb-4 text-mid font-medium text-text-secondary">Access Settings</p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {accessOptions.map((option) => (
              <AccessOption
                key={option.value}
                option={option}
                selected={access === option.value}
                onSelect={setAccess}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-44"
            onClick={() => router.push("/roles")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-56">
            Send invitation
          </Button>
        </div>
      </form>
    </div>
  );
}


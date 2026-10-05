"use client";

import { Button, ExportButton, Table } from "@/components/ReusableUi";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const teamMembers = [
  {
    id: "rhea-kapoor",
    name: "Rhea Kapoor",
    initials: "RK",
    email: "rhea.kapoor@eco-banx.com",
    team: "Compliance",
    role: "Admin",
    status: "Active",
    lastActive: "2 min ago",
  },
  {
    id: "karan-shah",
    name: "Karan Shah",
    initials: "KS",
    email: "karan.shah@eco-banx.com",
    team: "Support",
    role: "Support Team",
    status: "Active",
    lastActive: "16 min ago",
  },
  {
    id: "divya-menon",
    name: "Divya Menon",
    initials: "DM",
    email: "divya.menon@eco-banx.com",
    team: "Support",
    role: "Support Team",
    status: "Active",
    lastActive: "1 hr ago",
  },
  {
    id: "arjun-verma",
    name: "Arjun Verma",
    initials: "AV",
    email: "arjun.verma@eco-banx.com",
    team: "Finance",
    role: "Finance Team",
    status: "Active",
    lastActive: "3 hrs ago",
  },
  {
    id: "anjali-verma",
    name: "Anjali Verma",
    initials: "AV",
    email: "anjali.verma@eco-banx.com",
    team: "Finance",
    role: "Finance Team",
    status: "Active",
    lastActive: "3 hrs ago",
  },
];

const teamColumns = [
  {
    key: "name",
    header: "Name",
    cellClassName: "min-w-48",
    render: (value, row) => (
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-input-bg text-[10px] font-semibold text-theme-text">
          {row.initials}
        </span>
        <span className="font-medium">{value}</span>
      </div>
    ),
  },
  { key: "email", header: "Email", cellClassName: "min-w-64" },
  { key: "team", header: "Team", cellClassName: "min-w-36" },
  { key: "role", header: "Role", cellClassName: "min-w-40" },
  { key: "status", header: "Status", type: "status" },
  { key: "lastActive", header: "Last active", cellClassName: "min-w-36" },
];

const permissionRoles = ["Admin", "Manager", "Finance", "Support", "Compliance"];

const permissionRows = [
  { module: "Merchant Management", Admin: true, Manager: true, Finance: false, Support: false, Compliance: false },
  { module: "Transactions", Admin: true, Manager: true, Finance: true, Support: true, Compliance: false },
  { module: "Settlements", Admin: true, Manager: true, Finance: true, Support: false, Compliance: false },
  { module: "Refunds", Admin: true, Manager: true, Finance: true, Support: false, Compliance: false },
  { module: "KYC Verification", Admin: true, Manager: true, Finance: false, Support: false, Compliance: true },
  { module: "Fraud Detection", Admin: true, Manager: true, Finance: false, Support: false, Compliance: true },
  { module: "Reports", Admin: true, Manager: false, Finance: false, Support: true, Compliance: false },
  { module: "Settings", Admin: true, Manager: false, Finance: false, Support: true, Compliance: false },
];

function PermissionMark({ allowed }) {
  if (!allowed) {
    return <span className="text-text-secondary/40">-</span>;
  }

  return <span className="inline-block h-2 w-2 rounded-full bg-text-primary" />;
}

function PermissionMatrix() {
  return (
    <section className="space-y-3">
      <h2 className="text-large font-semibold text-theme-text">Permission matrix</h2>
      <div className="overflow-hidden rounded-rounded border border-input-border/40 bg-card-bg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-input-border/40">
                <th className="px-4 py-4 text-left text-small font-semibold uppercase text-text-secondary">
                  Module
                </th>
                {permissionRoles.map((role) => (
                  <th
                    key={role}
                    className="px-4 py-4 text-center text-small font-semibold uppercase text-text-secondary"
                  >
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionRows.map((row) => (
                <tr key={row.module}>
                  <td className="px-4 py-4 text-mid font-medium text-theme-text">
                    {row.module}
                  </td>
                  {permissionRoles.map((role) => (
                    <td key={role} className="px-4 py-4 text-center text-mid">
                      <PermissionMark allowed={row[role]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function RolesAndPermissionsPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">Roles & Permissions</h1>
          <p className="text-small text-text-secondary">Manage Admin Access Across Teams</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* <ExportButton rows={teamMembers} columns={teamColumns} fileName="eco-banx-roles.csv">
            Export PDF
          </ExportButton> */}
          <Button
            variant="primary"
            beforeIcon={<UserPlus className="h-4 w-4" />}
            className="w-full sm:w-auto"
            onClick={() => router.push("/roles/invite-team-member")}
          >
            Invite Team Members
          </Button>
        </div>
      </section>

      <Table
        columns={teamColumns}
        data={teamMembers}
        rowKey="id"
        showSearch={false}
        showViewAll={false}
        pagination={null}
        className="mt-0"
        tableClassName="min-w-[960px]"
      />

      <PermissionMatrix />
    </div>
  );
}

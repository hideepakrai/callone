import { ROLE_PERMISSIONS, type RoleKey } from "@/lib/auth/permissions";

export type LoginPreset = {
  label: string;
  email: string;
  description: string;
  role: RoleKey;
};

const DEV_LOGIN_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
  retailer: "Retailer",
};

const DEV_LOGIN_DESCRIPTIONS: Record<RoleKey, string> = {
  super_admin: "Full access to the workspace and operating controls.",
  admin: "Workspace administration and operating controls.",
  manager: "Approvals, team visibility, and follow-up.",
  sales_rep: "Order entry and daily sales activity.",
  retailer: "Partner retailer access.",
};

function normalizeEmail(value: string | undefined, fallback: string) {
  return (value ?? fallback).toLowerCase().trim();
}

export function isDevAutoLoginEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.CALLONE_DEV_AUTO_LOGIN === "true"
  );
}

export function getLoginPresets(): LoginPreset[] {
  return [
    {
      role: "super_admin",
      label: DEV_LOGIN_LABELS.super_admin,
      email: normalizeEmail(
        process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL,
        "admin@callone.local"
      ),
      description: DEV_LOGIN_DESCRIPTIONS.super_admin,
    },
    {
      role: "admin",
      label: DEV_LOGIN_LABELS.admin,
      email: normalizeEmail(
        process.env.CALLONE_BOOTSTRAP_SECONDARY_ADMIN_EMAIL,
        process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local"
      ),
      description: DEV_LOGIN_DESCRIPTIONS.admin,
    },
    {
      role: "manager",
      label: DEV_LOGIN_LABELS.manager,
      email: normalizeEmail(
        process.env.CALLONE_BOOTSTRAP_MANAGER_EMAIL,
        "manager@callone.local"
      ),
      description: DEV_LOGIN_DESCRIPTIONS.manager,
    },
    {
      role: "sales_rep",
      label: DEV_LOGIN_LABELS.sales_rep,
      email: normalizeEmail(
        process.env.CALLONE_BOOTSTRAP_SALES_EMAIL,
        "sales@callone.local"
      ),
      description: DEV_LOGIN_DESCRIPTIONS.sales_rep,
    },
    {
      role: "retailer",
      label: DEV_LOGIN_LABELS.retailer,
      email: normalizeEmail(
        process.env.CALLONE_BOOTSTRAP_RETAILER_EMAIL,
        "retailer@callone.local"
      ),
      description: DEV_LOGIN_DESCRIPTIONS.retailer,
    },
  ];
}

export function resolveDevLoginRole(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const matchedPreset = getLoginPresets().find(
    (preset) => preset.email === normalizedEmail
  );

  if (!matchedPreset) {
    return null;
  }

  return {
    id: normalizedEmail,
    name: matchedPreset.label,
    email: normalizedEmail,
    role: matchedPreset.role,
    permissions: ROLE_PERMISSIONS[matchedPreset.role],
  };
}

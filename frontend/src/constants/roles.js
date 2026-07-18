import {
  Home,
  Building2,
  Scale,
  Landmark,
  ShieldCheck,
} from "lucide-react";

/**
 * User roles supported by the platform.
 *
 * ROLES          → shown on public register page (no admin)
 * ALL_ROLES      → includes admin (for internal use, admin panel, seed data)
 *
 * Values MUST match backend RoleType enum:
 *   BUYER | REAL_ESTATE_AGENT | LEGAL_REVIEWER | FINANCIAL_INSTITUTION | ADMIN
 */
export const ROLES = [
  {
    label: "Buyer",
    value: "BUYER",
    description: "Search properties, run due diligence, and save reports.",
    icon: Home,
  },
  {
    label: "Real Estate Agent",
    value: "REAL_ESTATE_AGENT",
    description: "List properties, manage clients, and share verified reports.",
    icon: Building2,
  },
  {
    label: "Legal Reviewer",
    value: "LEGAL_REVIEWER",
    description: "Review title documents, flag disputes, and add legal notes.",
    icon: Scale,
  },
  {
    label: "Financial Institution",
    value: "FINANCIAL_INSTITUTION",
    description: "Assess loan risk, verify valuations, and export data.",
    icon: Landmark,
  },
];

/**
 * Full role list including admin.
 * Only used by:
 *   - Admin panel (future)
 *   - Backend seed scripts
 *   - Internal role lookups
 */
export const ALL_ROLES = [
  ...ROLES,
  {
    label: "Administrator",
    value: "ADMIN",
    description: "Full platform access. Manage users, roles, and audits.",
    icon: ShieldCheck,
  },
];
/**
 * User roles supported by the Real Estate Due Diligence platform.
 * Values MUST match the RoleType enum exactly:
 *   com.realestate.duediligence.enums.RoleType
 *
 * RoleType { BUYER, REAL_ESTATE_AGENT, LEGAL_REVIEWER, FINANCIAL_INSTITUTION, ADMIN }
 */
export const ROLES = [
  { label: "Buyer",                 value: "BUYER" },
  { label: "Real Estate Agent",     value: "REAL_ESTATE_AGENT" },
  { label: "Legal Reviewer",        value: "LEGAL_REVIEWER" },
  { label: "Financial Institution", value: "FINANCIAL_INSTITUTION" },
  { label: "Administrator",         value: "ADMIN" },
];

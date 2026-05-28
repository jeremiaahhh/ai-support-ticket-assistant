import type { TicketCategory, TicketPriority, TicketStatus } from "./types";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  billing: "Billing",
  technical_issue: "Technical Issue",
  account_access: "Account Access",
  feature_request: "Feature Request",
  bug_report: "Bug Report",
  general_question: "General Question",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const PRIORITY_ORDER: Record<TicketPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

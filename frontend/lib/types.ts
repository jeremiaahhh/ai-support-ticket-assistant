export type TicketCategory =
  | "billing"
  | "technical_issue"
  | "account_access"
  | "feature_request"
  | "bug_report"
  | "general_question";

export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved";

export const TICKET_CATEGORIES: TicketCategory[] = [
  "billing",
  "technical_issue",
  "account_access",
  "feature_request",
  "bug_report",
  "general_question",
];

export const TICKET_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "critical"];
export const TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved"];

export interface TicketAnalysis {
  id: string;
  ticket_id: string;
  category: TicketCategory;
  priority: TicketPriority;
  summary: string;
  suggested_response: string;
  reasoning_short: string;
  confidence_score: number;
  model_name: string;
  used_mock: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  customer_email?: string | null;
  customer_name?: string | null;
  category: TicketCategory | null;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  analysis: TicketAnalysis | null;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
}

export interface AnalyticsSummary {
  total_tickets: number;
  critical_tickets: number;
  resolved_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  analyzed_tickets: number;
  average_confidence: number;
  categories: { category: TicketCategory; count: number }[];
  priorities: { priority: TicketPriority; count: number }[];
  statuses: { status: TicketStatus; count: number }[];
}

export interface TicketCreateInput {
  subject: string;
  body: string;
  customer_email?: string;
  customer_name?: string;
  priority?: TicketPriority;
  category?: TicketCategory;
}

export interface TicketUpdateInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
}

export interface HealthResponse {
  status: "ok";
  ai_provider: "anthropic" | "openai";
  mock_mode: boolean;
}

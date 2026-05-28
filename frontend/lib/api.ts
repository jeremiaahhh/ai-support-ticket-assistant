import type {
  AnalyticsSummary,
  HealthResponse,
  Ticket,
  TicketAnalysis,
  TicketCategory,
  TicketCreateInput,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
  TicketUpdateInput,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: { code: string; message: string } };
      if (data.error) {
        code = data.error.code;
        message = data.error.message;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  listTickets: (params: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.priority) query.set("priority", params.priority);
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    const qs = query.toString();
    return request<TicketListResponse>(`/tickets${qs ? `?${qs}` : ""}`);
  },

  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),

  createTicket: (payload: TicketCreateInput) =>
    request<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTicket: (id: string, payload: TicketUpdateInput) =>
    request<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTicket: (id: string) =>
    request<void>(`/tickets/${id}`, { method: "DELETE" }),

  analyzeTicket: (id: string, force = false) =>
    request<TicketAnalysis>(`/tickets/${id}/analyze`, {
      method: "POST",
      body: JSON.stringify({ force }),
    }),

  analyticsSummary: () => request<AnalyticsSummary>("/analytics/summary"),
};

export const fetcher = (path: string) => request<unknown>(path);

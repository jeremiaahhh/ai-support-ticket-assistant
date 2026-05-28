import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriorityBadge } from "@/components/tickets/priority-badge";

describe("PriorityBadge", () => {
  it("renders the priority label", () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText(/critical/i)).toBeInTheDocument();
  });

  it("renders all known priorities", () => {
    for (const priority of ["low", "medium", "high", "critical"] as const) {
      const { unmount } = render(<PriorityBadge priority={priority} />);
      expect(screen.getByText(new RegExp(priority, "i"))).toBeInTheDocument();
      unmount();
    }
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClubApp } from "@/components/club-app";

describe("ClubApp", () => {
  it("opens on the dashboard and can navigate to reports", () => {
    render(<ClubApp skipIntro />);

    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reports/i }));
    expect(screen.getByRole("heading", { name: /today at a glance/i })).toBeInTheDocument();
  });

  it("starts a dummy e-game session without a database", () => {
    render(<ClubApp skipIntro />);

    fireEvent.click(screen.getAllByRole("button", { name: /book now/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /^e-game$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^start game$/i }));

    expect(screen.getByText(/game started/i)).toBeInTheDocument();
  });
});

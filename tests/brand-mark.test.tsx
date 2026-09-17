import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "@/components/brand-mark";

describe("BrandMark", () => {
  it("keeps the Snooker Club name accessible while rendering two red ball letters", () => {
    const { container } = render(<BrandMark />);

    expect(screen.getByLabelText("Snooker Club")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-brand-ball="true"]')).toHaveLength(2);
  });
});

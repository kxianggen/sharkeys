import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecommendationDemo } from "@/components/recommendation-demo";
import { CustomerReviewsSection } from "@/components/landing-sections";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/my-builds/actions", () => ({
  saveBuildAction: vi.fn(async () => ({ ok: true as const, id: "saved-1" })),
}));

afterEach(() => {
  vi.useRealTimers();
});

function activeReviewName(carousel: HTMLElement) {
  const active = carousel.querySelector('figure[aria-hidden="false"]');

  return active?.querySelector("figcaption span")?.textContent ?? null;
}

describe("landing founder quote section", () => {
  it("renders the founder statement with attribution and shop link", () => {
    render(<RecommendationDemo isAuthenticated={false} />);

    const section = screen.getByTestId("founder-quote-section");

    expect(section).toHaveTextContent(/I build keyboards/);
    expect(section).toHaveTextContent(/the tool I wish I'd had/i);
    expect(section).toHaveTextContent("Jayson");
    expect(section).toHaveTextContent("Builder @ sharkeys.");
    expect(
      within(section).getByRole("link", { name: "See my shop" }),
    ).toBeInTheDocument();
  });
});

describe("landing customer reviews section", () => {
  it("renders the real customer-count heading and anonymized reviews", () => {
    render(<RecommendationDemo isAuthenticated={false} />);

    const section = screen.getByTestId("customer-reviews-section");

    expect(section).toHaveTextContent(
      /Trusted by 500\+ customers across Malaysia/,
    );
    expect(section).toHaveTextContent("Wei L.");
    expect(section).toHaveTextContent("Aiman R.");
    expect(section).toHaveTextContent("Jia H.");
    expect(section).toHaveTextContent(/via Carousell/);
    // The "1 of 3" counter is gone.
    expect(section).not.toHaveTextContent(/\d of \d/);
  });

  it("steps through reviews with wrap-around arrows", () => {
    render(<RecommendationDemo isAuthenticated={false} />);

    const carousel = screen.getByTestId("review-carousel");
    const prev = within(carousel).getByRole("button", {
      name: "Previous review",
    });
    const next = within(carousel).getByRole("button", { name: "Next review" });

    expect(activeReviewName(carousel)).toBe("Wei L.");

    // Prev wraps backward to the last review.
    fireEvent.click(prev);
    expect(activeReviewName(carousel)).toBe("Jia H.");

    // Next wraps forward to the first again.
    fireEvent.click(next);
    expect(activeReviewName(carousel)).toBe("Wei L.");

    fireEvent.click(next);
    expect(activeReviewName(carousel)).toBe("Aiman R.");
  });

  it("auto-advances every 3 seconds and loops", () => {
    vi.useFakeTimers();
    render(<CustomerReviewsSection />);

    const carousel = screen.getByTestId("review-carousel");
    expect(activeReviewName(carousel)).toBe("Wei L.");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(activeReviewName(carousel)).toBe("Aiman R.");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(activeReviewName(carousel)).toBe("Jia H.");

    // Loops back to the first after the last.
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(activeReviewName(carousel)).toBe("Wei L.");
  });

  it("pauses auto-advance while hovered", () => {
    vi.useFakeTimers();
    render(<CustomerReviewsSection />);

    const carousel = screen.getByTestId("review-carousel");
    fireEvent.mouseEnter(carousel);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(activeReviewName(carousel)).toBe("Wei L.");

    // Resumes after the pointer leaves.
    fireEvent.mouseLeave(carousel);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(activeReviewName(carousel)).toBe("Aiman R.");
  });

  it("shows the real 5.0 marketplace ratings", () => {
    render(<RecommendationDemo isAuthenticated={false} />);

    const ratings = screen.getByTestId("marketplace-ratings");

    expect(within(ratings).getAllByText("5.0")).toHaveLength(2);
    expect(ratings).toHaveTextContent("Carousell");
    expect(ratings).toHaveTextContent("Shopee");
  });

  it("does not render on the configurator surface", () => {
    render(<RecommendationDemo isAuthenticated={false} mode="configurator" />);

    expect(screen.queryByTestId("founder-quote-section")).toBeNull();
    expect(screen.queryByTestId("customer-reviews-section")).toBeNull();
  });
});

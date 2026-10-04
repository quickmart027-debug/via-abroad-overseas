import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { destinations } from "@/data/destinations";
import { DestinationSelector } from "@/components/destinations/destination-selector";

// The real map fetches TopoJSON client-side and renders SVG via d3 — neither
// is meaningful in jsdom. Stub it down to its onSelect/onPreview contract so
// this file can verify state orchestration (the thing it owns), leaving the
// actual map rendering to the Playwright e2e spec.
vi.mock("@/components/destinations/destination-map", () => ({
  DestinationMap: ({
    destinations: mapDestinations,
    onSelect,
  }: {
    destinations: { slug: string }[];
    onSelect: (slug: string) => void;
  }) => (
    <div data-testid="map-stub">
      {mapDestinations.map((d) => (
        <button key={d.slug} onClick={() => onSelect(d.slug)}>
          {`map-select:${d.slug}`}
        </button>
      ))}
    </div>
  ),
}));

const usa = destinations.find((d) => d.slug === "usa")!;

describe("DestinationSelector", () => {
  beforeEach(() => {
    // jsdom has no matchMedia; default to the mobile path (matches: false)
    // since the bottom-sheet behavior is what these tests exercise.
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    cleanup();
  });

  it("marks the chip aria-pressed and opens the bottom sheet on selection", async () => {
    render(<DestinationSelector destinations={destinations} />);

    const chip = screen.getByRole("button", { name: usa.name });
    expect(chip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(chip);

    expect(chip).toHaveAttribute("aria-pressed", "true");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(`Explore ${usa.name}`)).toBeInTheDocument();
  });

  it("closes the bottom sheet via the close control", async () => {
    render(<DestinationSelector destinations={destinations} />);

    fireEvent.click(screen.getByRole("button", { name: usa.name }));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByText("Close"));

    await vi.waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("selecting from the map stub drives the same selection state as a chip", async () => {
    render(<DestinationSelector destinations={destinations} />);

    fireEvent.click(screen.getByText(`map-select:${usa.slug}`));

    // The open modal dialog aria-hides its background siblings (correct
    // Radix behavior), so query with `hidden: true` to still reach the chip.
    expect(screen.getByRole("button", { name: usa.name, hidden: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(`Explore ${usa.name}`)).toBeInTheDocument();
  });
});

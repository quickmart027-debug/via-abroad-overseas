import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { destinations } from "@/data/destinations";
import { DestinationPreviewContent } from "@/components/destinations/destination-preview-content";
import { DestinationPreviewPanel } from "@/components/destinations/destination-preview-panel";

describe("DestinationPreviewContent reuse", () => {
  const usa = destinations.find((d) => d.slug === "usa")!;

  afterEach(() => {
    cleanup();
  });

  it("renders only existing Destination fields (no invented stats)", () => {
    render(<DestinationPreviewContent destination={usa} />);

    expect(screen.getByText(usa.tagline)).toBeInTheDocument();
    for (const highlight of usa.highlights) expect(screen.getByText(highlight)).toBeInTheDocument();
    for (const area of usa.popularAreas) expect(screen.getByText(area)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Explore ${usa.name}` })).toHaveAttribute(
      "href",
      `/destinations/${usa.slug}`
    );
  });

  it("produces identical content whether reached via the preview panel or directly", () => {
    const direct = renderToStaticMarkup(<DestinationPreviewContent destination={usa} />);
    const viaPanel = renderToStaticMarkup(<DestinationPreviewPanel destination={usa} />);

    expect(viaPanel).toContain(direct);
  });
});

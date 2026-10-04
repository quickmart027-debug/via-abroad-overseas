import { cn } from "@/lib/utils";

/**
 * Scroll reveal as progressive enhancement. Content is fully visible in the
 * server-rendered HTML; browsers that support scroll-driven animations
 * (`animation-timeline: view()`) fade it up as it enters the viewport, and
 * everything else — no JS, older browsers, reduced motion — simply shows
 * it. No client JavaScript is involved, so these stay Server Components.
 * See `.reveal` in app/globals.css.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds in the old motion API; mapped to a short scroll offset. */
  delay?: number;
  as?: "div" | "li";
}) {
  const Comp = as;
  return (
    <Comp
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-delay": Math.min(delay, 0.3) } as React.CSSProperties) : undefined}
    >
      {children}
    </Comp>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal-stagger", className)}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal", className)}>{children}</div>;
}

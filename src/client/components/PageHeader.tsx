import type { ComponentProps, ReactNode } from "react";
import { createLink } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "cn";
import { PageHelpButton } from "@/client/features/help/PageHelpButton";
import type { PageHelpTopic } from "@/client/features/help/pageHelpContent";

/**
 * The page title, with an optional subtitle and actions on the right. A
 * `backLink` (a `BackLink` or `BackButton`) sits above the title.
 */
export function PageHeader({
  title,
  description,
  actions,
  backLink,
  help,
}: {
  title: ReactNode;
  /** A subtitle, or metadata such as a `<dl>`. */
  description?: ReactNode;
  actions?: ReactNode;
  backLink?: ReactNode;
  /** Shows a "?" next to the title that explains the page. */
  help?: PageHelpTopic;
}) {
  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1 basis-64 space-y-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {help ? <PageHelpButton topic={help} /> : null}
        </div>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
  if (!backLink) return header;
  return (
    <div className="space-y-3">
      {backLink}
      {header}
    </div>
  );
}

/** The heading of one section on a page, with an optional hint and action. */
export function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

const BACK_LINK_CLASS =
  "inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground";

function BackLinkAnchor({
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a {...props} className={cn(BACK_LINK_CLASS, className)}>
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </a>
  );
}

/** A router link back to the parent page, with a chevron before its label. */
export const BackLink = createLink(BackLinkAnchor);

/** `BackLink` for a page whose way back is a callback, not a route. */
export function BackButton({
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(BACK_LINK_CLASS, "cursor-pointer", className)}
    >
      <ChevronLeft className="size-4" aria-hidden />
      {children}
    </button>
  );
}

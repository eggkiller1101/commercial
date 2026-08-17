import type { ReactNode } from "react";

export function SectionHeading({
  action,
  eyebrow,
  subtitle,
  title
}: {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

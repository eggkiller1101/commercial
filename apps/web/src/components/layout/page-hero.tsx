import type { ReactNode } from "react";

export function PageHero({
  children,
  description,
  eyebrow,
  title
}: {
  children?: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="bg-primary-900 text-neutral-0">
      <div className="mx-auto max-w-site px-4 py-10">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[2px] text-secondary-300">
          {eyebrow}
        </div>
        <h1 className="max-w-2xl text-[28px] font-bold leading-tight md:text-[34px]">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-300">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

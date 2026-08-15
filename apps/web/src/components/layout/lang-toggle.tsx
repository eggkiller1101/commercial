"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocale } from "@/features/i18n/actions";
import type { Locale } from "@/lib/i18n/dictionary";

export function LangToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const otherLocale: Locale = locale === "zh" ? "en" : "zh";
  const otherLabel = locale === "zh" ? "English" : "中文";

  return (
    <button
      className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/70 hover:text-neutral-0 disabled:opacity-60"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await setLocale(otherLocale);
          router.refresh();
        });
      }}
      type="button"
    >
      {otherLabel}
    </button>
  );
}

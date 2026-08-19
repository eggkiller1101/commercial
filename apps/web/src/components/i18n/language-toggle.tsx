"use client";

import { useRouter } from "next/navigation";

import { localeCookieName, type Locale } from "@/lib/i18n/dictionaries";

export function LanguageToggle({
  currentLocale,
  label
}: {
  currentLocale: Locale;
  label: string;
}) {
  const router = useRouter();
  const nextLocale: Locale = currentLocale === "zh" ? "en" : "zh";

  function switchLanguage() {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button className="lang-toggle-btn" onClick={switchLanguage} type="button">
      {label}
    </button>
  );
}

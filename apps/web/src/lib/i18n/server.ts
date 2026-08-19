import { cookies } from "next/headers";

import {
  defaultLocale,
  getDictionary,
  localeCookieName,
  normalizeLocale,
  type Locale
} from "@/lib/i18n/dictionaries";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  return normalizeLocale(cookieLocale ?? defaultLocale);
}

export async function getRequestDictionary() {
  const locale = await getRequestLocale();

  return {
    dictionary: getDictionary(locale),
    locale
  };
}

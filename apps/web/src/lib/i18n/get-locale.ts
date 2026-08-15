import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./dictionary";

/** 服务端组件专用：从 cookie 读当前语言，读不到就回退中文。 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;

  return value === "en" ? "en" : DEFAULT_LOCALE;
}

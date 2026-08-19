import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getRequestDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const { dictionary } = await getRequestDictionary();
  const t = dictionary.common;

  return (
    <div className="mx-auto flex min-h-[24rem] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">{t.notFoundTitle}</h1>
      <p className="mt-3 text-muted-foreground">{t.notFoundDescription}</p>
      <Button asChild className="mt-6">
        <Link href="/">{t.backHome}</Link>
      </Button>
    </div>
  );
}

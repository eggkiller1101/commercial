import Link from "next/link";

import { Button } from "@/components/ui/button";

type NotFoundStateProps = {
  backHref: string;
  backText: string;
  title: string;
};

export function NotFoundState({
  backHref,
  backText,
  title
}: NotFoundStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button asChild variant="ghost">
          <Link href={backHref}>{backText}</Link>
        </Button>
      </div>
    </div>
  );
}

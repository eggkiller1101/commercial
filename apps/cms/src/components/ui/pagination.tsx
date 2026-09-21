import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
};

export function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const currentPage = Math.max(1, Math.min(page, totalPages));
  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstPage + index
  );
  const pageHref = (target: number) => `${basePath}?page=${target}`;
  const pageClass =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-transparent text-sm hover:bg-muted";

  return (
    <nav
      aria-label="分页"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      {currentPage > 1 ? (
        <Link aria-label="上一页" className={pageClass} href={pageHref(currentPage - 1)}>
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${pageClass} opacity-40`}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {visiblePages.map((visiblePage) =>
        visiblePage === currentPage ? (
          <span
            aria-current="page"
            className={`${pageClass} border-primary font-semibold text-primary`}
            key={visiblePage}
          >
            {visiblePage}
          </span>
        ) : (
          <Link
            aria-label={`第 ${visiblePage} 页`}
            className={pageClass}
            href={pageHref(visiblePage)}
            key={visiblePage}
          >
            {visiblePage}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link aria-label="下一页" className={pageClass} href={pageHref(currentPage + 1)}>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${pageClass} opacity-40`}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}

      <span className="ml-2 whitespace-nowrap text-sm text-muted-foreground">
        共 {totalPages} 页
      </span>
      <form action={basePath} className="ml-2 flex items-center gap-2 text-sm">
        <label htmlFor="pagination-page">跳至</label>
        <input
          className="h-8 w-14 rounded border border-input bg-background px-1 text-center"
          id="pagination-page"
          inputMode="numeric"
          max={totalPages}
          min={1}
          name="page"
          required
          type="number"
        />
        <button
          className="h-8 rounded border border-primary bg-primary px-2 font-semibold text-primary-foreground hover:bg-primary/90"
          type="submit"
        >
          Go
        </button>
      </form>
    </nav>
  );
}

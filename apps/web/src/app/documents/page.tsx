import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHero } from "@/components/layout/page-hero";
import { DocumentList } from "@/components/documents/document-list";
import { getPublishedDocuments } from "@/features/documents/data";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function DocumentsPage() {
  const [documents, locale] = await Promise.all([getPublishedDocuments(), getLocale()]);

  return (
    <div>
      <Breadcrumb items={[{ href: "/documents", label: t(locale, "nav.documents") }]} locale={locale} />

      <PageHero
        description={t(locale, "documents.heroDesc")}
        eyebrow={t(locale, "documents.heroEyebrow")}
        title={t(locale, "documents.heroTitle")}
      />

      <div className="mx-auto max-w-site px-4 py-10">
        <DocumentList documents={documents} locale={locale} />
      </div>
    </div>
  );
}

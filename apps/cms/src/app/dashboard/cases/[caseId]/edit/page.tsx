import { notFound } from "next/navigation";

import { CaseForm } from "@/features/cases/case-form";
import { getCaseById } from "@/features/cases/data";

type EditCasePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function EditCasePage({ params }: EditCasePageProps) {
  const { caseId } = await params;
  const caseItem = await getCaseById(caseId);

  if (!caseItem) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">案例编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          保存后案例会重新上架。
        </p>
      </div>

      <CaseForm defaultValues={caseItem} />
    </div>
  );
}

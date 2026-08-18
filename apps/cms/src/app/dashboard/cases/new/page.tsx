import { CaseForm } from "@/features/cases/case-form";

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">案例新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          填写用于 web 前台展示的案例内容。
        </p>
      </div>

      <CaseForm />
    </div>
  );
}

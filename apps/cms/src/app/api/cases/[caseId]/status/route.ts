import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateCaseStatus } from "@/features/cases/data";

type CaseStatusRouteProps = {
  params: Promise<{
    caseId: string;
  }>;
};

type CaseStatusRequestBody = {
  status?: string;
};

export async function PATCH(
  request: Request,
  { params }: CaseStatusRouteProps
) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { caseId } = await params;
  const body = (await request.json()) as CaseStatusRequestBody;

  if (body.status !== "published" && body.status !== "archived") {
    return NextResponse.json(
      { message: "案例状态无效", ok: false },
      { status: 400 }
    );
  }

  const result = await updateCaseStatus({
    caseId,
    status: body.status
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, ok: false },
      { status: 400 }
    );
  }

  return NextResponse.json(result);
}

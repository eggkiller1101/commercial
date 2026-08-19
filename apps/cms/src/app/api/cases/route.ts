import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { createCase } from "@/features/cases/data";

type CaseRequestBody = {
  author?: string;
  category?: string;
  content?: string;
  coverImageUrl?: string;
  seoDescription?: string;
  seoTitle?: string;
  summary?: string;
  title?: string;
};

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const body = (await request.json()) as CaseRequestBody;

  if (
    !body.title?.trim() ||
    !body.category?.trim() ||
    !body.summary?.trim() ||
    !body.content?.trim()
  ) {
    return NextResponse.json(
      { message: "案例标题、案例分类、案例摘要、案例正文均为必填" },
      { status: 400 }
    );
  }

  const result = await createCase({
    author: body.author ?? "",
    category: body.category,
    content: body.content,
    coverImageUrl: body.coverImageUrl ?? "",
    createdBy: permission.session?.adminUserId,
    seoDescription: body.seoDescription ?? "",
    seoTitle: body.seoTitle ?? "",
    summary: body.summary,
    title: body.title
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

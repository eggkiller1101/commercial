import { NextResponse } from "next/server";

import { updateAdminPassword } from "@/features/auth/data";
import { getCmsSession } from "@/features/auth/session";

type ChangePasswordRequestBody = {
  confirmPassword?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  const session = await getCmsSession();

  if (!session) {
    return NextResponse.json(
      { message: "请先登录", ok: false },
      { status: 401 }
    );
  }

  const body = (await request.json()) as ChangePasswordRequestBody;
  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { message: "请完整填写密码信息", ok: false },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { message: "新密码至少需要8位", ok: false },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { message: "两次输入的新密码不一致", ok: false },
      { status: 400 }
    );
  }

  const result = await updateAdminPassword({
    adminUserId: session.adminUserId,
    currentPassword,
    newPassword
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

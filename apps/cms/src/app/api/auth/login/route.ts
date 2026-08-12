import { NextResponse } from "next/server";

import { verifyAdminLogin } from "@/features/auth/data";
import { setCmsSession } from "@/features/auth/session";

type LoginRequestBody = {
  password?: string;
  username?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { message: "请输入账号和密码", ok: false },
      { status: 400 }
    );
  }

  const result = await verifyAdminLogin(username, password);

  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }

  await setCmsSession({
    adminUserId: result.adminUserId,
    roleName: result.roleName,
    username: result.username
  });

  return NextResponse.json({ ok: true });
}

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
  getDefaultDashboardPath,
  hasPermission,
  type Permission
} from "@/features/auth/permissions";
import { getCmsSession } from "@/features/auth/session";

export async function requirePagePermission(permission: Permission) {
  const session = await getCmsSession();

  if (!session) {
    redirect("/");
  }

  if (!hasPermission(session.roleName, permission)) {
    redirect(getDefaultDashboardPath(session.roleName));
  }

  return session;
}

export async function requireApiPermission(permission: Permission) {
  const session = await getCmsSession();

  if (!session) {
    return {
      response: NextResponse.json(
        { message: "请先登录", ok: false },
        { status: 401 }
      ),
      session: null
    };
  }

  if (!hasPermission(session.roleName, permission)) {
    return {
      response: NextResponse.json(
        { message: "没有权限操作该模块", ok: false },
        { status: 403 }
      ),
      session
    };
  }

  return {
    response: null,
    session
  };
}

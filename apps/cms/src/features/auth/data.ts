import bcrypt from "bcryptjs";

import { normalizeAdminRole } from "@/features/auth/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type AuthResult =
  | {
      adminUserId: number;
      ok: true;
      roleName: string;
      username: string;
    }
  | {
      message: string;
      ok: false;
    };

export async function verifyAdminLogin(
  username: string,
  password: string
): Promise<AuthResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "后台登录服务尚未配置",
      ok: false
    };
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id,username,password_hash,is_active,roles(name)")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("Failed to load admin user", error);
    return {
      message: "登录失败，请稍后重试",
      ok: false
    };
  }

  if (!adminUser || !adminUser.is_active) {
    return {
      message: "账号或密码错误",
      ok: false
    };
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    adminUser.password_hash
  );

  if (!isPasswordValid) {
    return {
      message: "账号或密码错误",
      ok: false
    };
  }

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", adminUser.id);

  return {
    adminUserId: adminUser.id,
    ok: true,
    roleName: normalizeAdminRole(adminUser.roles?.name),
    username: adminUser.username
  };
}

export async function updateAdminPassword(params: {
  adminUserId: number;
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "后台登录服务尚未配置",
      ok: false
    };
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id,username,password_hash,is_active")
    .eq("id", params.adminUserId)
    .maybeSingle();

  if (error || !adminUser || !adminUser.is_active) {
    if (error) {
      console.error("Failed to load admin user for password update", error);
    }

    return {
      message: "无法修改密码，请重新登录",
      ok: false
    };
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    params.currentPassword,
    adminUser.password_hash
  );

  if (!isCurrentPasswordValid) {
    return {
      message: "当前密码不正确",
      ok: false
    };
  }

  const passwordHash = await bcrypt.hash(params.newPassword, 10);
  const { error: updateError } = await supabase
    .from("admin_users")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq("id", params.adminUserId);

  if (updateError) {
    console.error("Failed to update admin password", updateError);

    return {
      message: "修改密码失败，请稍后重试",
      ok: false
    };
  }

  return {
    adminUserId: adminUser.id,
    ok: true,
    roleName: "",
    username: adminUser.username
  };
}

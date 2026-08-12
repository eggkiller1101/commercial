import { ChangePasswordForm } from "@/features/auth/change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">修改密码</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          修改当前后台账号的登录密码。
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}

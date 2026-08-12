export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-semibold">欢迎进入企业后台管理</p>
        <p className="mt-2 text-sm text-muted-foreground">
          请从左侧菜单选择需要管理的模块。
        </p>
      </div>
    </div>
  );
}

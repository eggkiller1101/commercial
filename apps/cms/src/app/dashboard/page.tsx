import { redirect } from "next/navigation";

import { getDefaultDashboardPath } from "@/features/auth/permissions";
import { getCmsSession } from "@/features/auth/session";

export default async function DashboardPage() {
  const session = await getCmsSession();

  if (!session) {
    redirect("/");
  }

  redirect(getDefaultDashboardPath(session.roleName));
}

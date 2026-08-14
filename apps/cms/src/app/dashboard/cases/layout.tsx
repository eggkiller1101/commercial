import { requirePagePermission } from "@/features/auth/guards";

export default async function CasesLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePagePermission("manage_content");

  return children;
}

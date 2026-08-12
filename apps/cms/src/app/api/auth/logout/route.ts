import { NextResponse } from "next/server";

import { clearCmsSession } from "@/features/auth/session";

export async function POST() {
  await clearCmsSession();

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActivityLog } from "@/lib/notion";

export const revalidate = 300;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activity = await getActivityLog();
    return NextResponse.json(activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch activity log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

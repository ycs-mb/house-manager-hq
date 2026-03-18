import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getChores } from "@/lib/notion";

export const revalidate = 300;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chores = await getChores();
    return NextResponse.json(chores);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch chores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

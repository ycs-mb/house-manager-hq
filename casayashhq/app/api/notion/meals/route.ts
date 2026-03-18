import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMealPlan } from "@/lib/notion";

export const revalidate = 300;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meals = await getMealPlan();
    return NextResponse.json(meals);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch meal plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const nextStatus = parsed.data.action === "approve" ? "approved" : "rejected";

    const updated = await prisma.approval.update({
      where: { id },
      data: {
        status: nextStatus,
        note: parsed.data.note,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update approval";
    const statusCode = message.includes("Record to update not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

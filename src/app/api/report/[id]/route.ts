import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({
    where: { id },
    include: { business: true },
  });

  if (!scan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: scan.id,
    score: scan.score,
    createdAt: scan.createdAt,
    business: scan.business,
    tools: JSON.parse(scan.details),
    recommendations: JSON.parse(scan.recommendations),
  });
}

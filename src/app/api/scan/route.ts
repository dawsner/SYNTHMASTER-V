import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanBusinessVisibility } from "@/lib/scan-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, industry, description, location, userId } = body;

    if (!name || !industry || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const business = await prisma.business.create({
      data: { name, website, industry, description, location, userId },
    });

    const result = await scanBusinessVisibility({ name, website, industry, description, location });

    const scan = await prisma.scan.create({
      data: {
        businessId: business.id,
        score: result.score,
        details: JSON.stringify(result.tools),
        recommendations: JSON.stringify(result.recommendations),
      },
    });

    return NextResponse.json({
      scanId: scan.id,
      businessId: business.id,
      score: result.score,
      summary: result.summary,
      tools: result.tools,
      recommendations: result.recommendations,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}

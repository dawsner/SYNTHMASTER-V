import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, userId, businessContext } = await req.json();

    let session = sessionId
      ? await prisma.coachSession.findUnique({ where: { id: sessionId } })
      : null;

    const history: { role: "user" | "assistant"; content: string }[] = session
      ? JSON.parse(session.messages)
      : [];

    history.push({ role: "user", content: message });

    const systemPrompt = `You are an expert AI visibility coach for businesses. Your job is to help businesses improve their visibility in AI tools like ChatGPT, Perplexity, Claude, and Gemini.

${businessContext ? `Business context: ${JSON.stringify(businessContext)}` : ""}

Respond in Hebrew. Be specific, actionable, and encouraging. When giving advice:
- Focus on practical steps to improve AI visibility
- Explain WHY each action helps with AI tools
- Give concrete examples
- Prioritize quick wins first

Keep responses concise but valuable. Use emojis sparingly for readability.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const assistantMessage = response.content[0];
    if (assistantMessage.type !== "text") throw new Error("Unexpected type");

    history.push({ role: "assistant", content: assistantMessage.text });

    if (session) {
      await prisma.coachSession.update({
        where: { id: session.id },
        data: { messages: JSON.stringify(history) },
      });
    } else if (userId) {
      session = await prisma.coachSession.create({
        data: { userId, messages: JSON.stringify(history) },
      });
    }

    return NextResponse.json({
      reply: assistantMessage.text,
      sessionId: session?.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Coach unavailable" }, { status: 500 });
  }
}

import { anthropic } from "./anthropic";

export interface LLMToolResult {
  tool: string;
  mentioned: boolean;
  prominence: number; // 0-10
  accuracy: number;   // 0-10
  snippet: string;
  issues: string[];
}

export interface ScanResult {
  score: number;
  tools: LLMToolResult[];
  recommendations: string[];
  summary: string;
}

const LLM_TOOLS = ["ChatGPT", "Perplexity AI", "Google Gemini", "Claude AI"];

export async function scanBusinessVisibility(business: {
  name: string;
  website?: string | null;
  industry: string;
  description: string;
  location?: string | null;
}): Promise<ScanResult> {
  const prompt = `You are an AI visibility analyst. Analyze how well the following business would appear when users search for it or related services in major LLM tools.

Business Details:
- Name: ${business.name}
- Website: ${business.website || "Not provided"}
- Industry: ${business.industry}
- Description: ${business.description}
- Location: ${business.location || "Not specified"}

For each of the following LLM tools: ${LLM_TOOLS.join(", ")}

Simulate and evaluate what each tool would say about this business if a user asked:
1. "[industry] services near me" or "[industry] companies"
2. "Tell me about ${business.name}"
3. "Best [industry] providers"

Return a JSON response with this exact structure:
{
  "summary": "2-3 sentence overall assessment in Hebrew",
  "score": <overall score 0-100>,
  "tools": [
    {
      "tool": "ChatGPT",
      "mentioned": <true/false>,
      "prominence": <0-10>,
      "accuracy": <0-10>,
      "snippet": "Example of what this tool would say about the business (in Hebrew, 1-2 sentences)",
      "issues": ["issue1 in Hebrew", "issue2 in Hebrew"]
    }
  ],
  "recommendations": [
    "specific recommendation in Hebrew",
    "specific recommendation in Hebrew"
  ]
}

Be realistic and honest. Most small businesses have low AI visibility. Score harshly but helpfully.
Provide 5-7 specific, actionable recommendations.
Return ONLY valid JSON, no markdown.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const parsed = JSON.parse(content.text) as ScanResult;
  return parsed;
}

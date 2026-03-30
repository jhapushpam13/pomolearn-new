import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, cycles = 4, apiKey, model: modelName } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid topic is required." },
        { status: 400 }
      );
    }

    // Rate limit check — only apply when using the default (server) key
    if (!apiKey) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const rateLimit = checkRateLimit(ip);

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error:
              "RATE_LIMITED: Your AI credits are exhausted. Please enter your own Gemini API key in Settings to continue.",
            rateLimited: true,
          },
          { status: 429 }
        );
      }
    }

    const totalCycles = Math.min(Math.max(1, Number(cycles)), 8);
    console.log(
      `Generating content for topic: "${topic}", cycles: ${totalCycles}, customKey: ${!!apiKey}`
    );

    let aiModel;
    try {
      aiModel = getModel(apiKey, modelName);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const cyclesContent: string[] = [];

    for (let i = 1; i <= totalCycles; i++) {
      const prompt = `
You are an AI assistant creating learning material for a Pomodoro-based learning app called Pomolearn.
The user wants to learn about: "${topic}".
This is Cycle ${i} of ${totalCycles}.
Generate a descriptive, pointer-based explanation suitable for a 25-minute study session (approx. 1000-1500 words).
Focus on relevant sub-topics for this specific cycle, progressing logically from previous cycles (if any).
Use clear Markdown formatting:
- Use '##' for main sub-topic headings within this cycle.
- Use bullet points (* or -) for lists.
- Use **bold text** for important terms or emphasis.
Ensure the content is informative and easy to digest within the time frame.
Do NOT include introductory or concluding phrases like "In this cycle..." or "Next cycle we will...". Just provide the core content for Cycle ${i}.

**Content for Cycle ${i}:**
`;

      console.log(`Requesting content for Cycle ${i}...`);
      const result = await aiModel.generateContent(prompt);
      const response = result.response;

      const safetyRatings = response.promptFeedback?.safetyRatings;
      if (safetyRatings && safetyRatings.some((r: any) => r.blocked)) {
        console.warn(`Safety block detected for Cycle ${i}.`);
        throw new Error(
          `Content generation for Cycle ${i} was blocked due to safety settings. Try rephrasing the topic.`
        );
      }

      const text = response.text();
      console.log(`Received content for Cycle ${i}. Length: ${text.length}`);
      cyclesContent.push(text.trim());
    }

    console.log("Content generation complete.");
    return NextResponse.json({ cycles: cyclesContent });
  } catch (error: any) {
    console.error("Error generating content:", error);

    if (
      error.message?.includes("SAFETY") ||
      error.message?.includes("safety settings")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check for invalid API key errors
    if (
      error.message?.includes("API_KEY_INVALID") ||
      error.message?.includes("API key not valid") ||
      error.status === 400
    ) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Gemini API key in Settings." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate learning content from AI: " + error.message },
      { status: 500 }
    );
  }
}

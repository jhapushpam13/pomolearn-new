import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, questionCount = 25, apiKey, model: modelName } = body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json(
        { error: "Content (as an array) is required to generate quiz" },
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

    let aiModel;
    try {
      aiModel = getModel(apiKey, modelName);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const numQuestions = Math.min(Math.max(1, Number(questionCount)), 40);
    const combinedContent = content.join("\n\n---\n\n");

    console.log(
      `Generating ${numQuestions} MCQs (customKey: ${!!apiKey})...`
    );

    const prompt = `
Based *only* on the following learning material provided below, generate exactly ${numQuestions} multiple-choice questions (MCQs) to test understanding.

For each question:
1.  Create a clear question assessing knowledge from the text.
2.  Provide 4 distinct options (A, B, C, D).
3.  Clearly indicate the single correct answer.

Format the output *only* as a valid JSON array of objects. Each object in the array must have the following keys:
- "question": (string) The question text.
- "options": (array of 4 strings) The answer choices [A, B, C, D].
- "correctAnswer": (string) The exact text of the correct option.

Do not include any text before or after the JSON array. Ensure the JSON is perfectly formatted.

--- LEARNING MATERIAL START ---
${combinedContent}
--- LEARNING MATERIAL END ---

JSON Output:
`;

    const result = await aiModel.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean the response to get only the JSON part
    text = text.trim();
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error(
        "AI response did not contain a valid JSON array structure."
      );
    }
    const jsonString = text.substring(jsonStart, jsonEnd + 1);

    let mcqs;
    try {
      mcqs = JSON.parse(jsonString);
      if (
        !Array.isArray(mcqs) ||
        mcqs.length === 0 ||
        !mcqs[0].question ||
        !mcqs[0].options ||
        !mcqs[0].correctAnswer
      ) {
        throw new Error("Parsed JSON is not in the expected format.");
      }
      mcqs = mcqs.map((q: any, index: number) => ({
        ...q,
        id: `q-${index}`,
      }));
    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", parseError);
      console.error("Raw AI response:\n", text);
      throw new Error("AI response was not valid JSON.");
    }

    console.log(`Successfully generated and parsed ${mcqs.length} MCQs.`);
    return NextResponse.json({ mcqs });
  } catch (error: any) {
    console.error("Error generating quiz:", error);

    if (error.message?.includes("SAFETY")) {
      return NextResponse.json(
        {
          error:
            "Quiz generation failed due to safety settings based on the content.",
        },
        { status: 400 }
      );
    }

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
      { error: "Failed to generate quiz from AI: " + error.message },
      { status: 500 }
    );
  }
}

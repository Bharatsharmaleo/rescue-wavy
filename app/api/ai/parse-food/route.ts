import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

function localFoodClassifier(description: string) {
  const text = description.toLowerCase();

  let category = "other";

  if (
    text.includes("rice") ||
    text.includes("dal") ||
    text.includes("curry") ||
    text.includes("sabzi") ||
    text.includes("roti") ||
    text.includes("chapati") ||
    text.includes("meal") ||
    text.includes("cooked")
  ) {
    category = "cooked";
  } else if (
    text.includes("apple") ||
    text.includes("banana") ||
    text.includes("orange") ||
    text.includes("fruit") ||
    text.includes("mango") ||
    text.includes("grape")
  ) {
    category = "fruits";
  } else if (
    text.includes("bread") ||
    text.includes("cake") ||
    text.includes("pastry") ||
    text.includes("biscuit") ||
    text.includes("bakery")
  ) {
    category = "bakery";
  } else if (
    text.includes("packet") ||
    text.includes("packaged") ||
    text.includes("chips") ||
    text.includes("noodles") ||
    text.includes("canned")
  ) {
    category = "packaged";
  }

  const words = text
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter((word: string) => word.length > 3);

  const keywords = Array.from(new Set(words)).slice(0, 6);

  return {
    category,
    items: keywords.slice(0, 4),
    keywords,
    summary: description.trim(),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = body.description;

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Food description is required." },
        { status: 400 }
      );
    }

    /*
     * Try real Gemini AI first.
     */

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });

        const prompt = `
You are the food classification assistant for RescueWavy.

Analyze this donor's food description:

"${description}"

Return ONLY valid JSON:

{
  "category": "cooked",
  "items": ["rice", "dal"],
  "keywords": ["rice", "dal", "cooked food"],
  "summary": "12 kg of cooked rice and dal"
}

Allowed category values:
- cooked
- fruits
- packaged
- bakery
- other

Rules:
- Do not invent quantity.
- Do not invent expiry time.
- Do not make food-safety claims.
- Keep items and keywords short.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        if (response.text) {
          const result = JSON.parse(response.text);

          return NextResponse.json({
            ...result,
            source: "gemini",
          });
        }
      } catch (geminiError) {
        console.error(
          "Gemini temporarily unavailable. Using local fallback.",
          geminiError
        );
      }
    }

    /*
     * Fallback so the RescueWavy demo keeps working
     * even if Gemini is temporarily unavailable.
     */

    const fallbackResult = localFoodClassifier(description);

    return NextResponse.json({
      ...fallbackResult,
      source: "fallback",
    });
  } catch (error) {
    console.error("Food analysis error:", error);

    return NextResponse.json(
      { error: "Food analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
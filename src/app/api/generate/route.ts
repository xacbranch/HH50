import { NextRequest, NextResponse } from "next/server";
import { getRandomPrompt } from "@/lib/prompt-engine";
import type { Era, Region } from "@/lib/prompt-data";

export const maxDuration = 60;

const VALID_ERAS: Era[] = ["70s", "80s", "90s", "00s", "10s"];
const VALID_REGIONS: Region[] = ["east", "west", "south", "midwest", "international"];

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const era = formData.get("era") as string | null;
    const region = formData.get("region") as string | null;

    if (!image || !era || !region) {
      return NextResponse.json(
        { error: "Missing image, era, or region" },
        { status: 400 }
      );
    }

    if (!VALID_ERAS.includes(era as Era) || !VALID_REGIONS.includes(region as Region)) {
      return NextResponse.json(
        { error: "Invalid era or region" },
        { status: 400 }
      );
    }

    // Pick a random variant prompt from the CSV
    const prompt = getRandomPrompt(era as Era, region as Region);

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    // Use Gemini 3 Pro Image (Nano Banana Pro)
    const model = "gemini-3-pro-image-preview";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", response.status, errorData.slice(0, 500));
      return NextResponse.json(
        { error: `Image generation failed (${response.status}). Please try again.` },
        { status: 500 }
      );
    }

    const responseText = await response.text();
    if (!responseText) {
      console.error("Gemini returned empty response body");
      return NextResponse.json(
        { error: "Empty response from image generation. Please try again." },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Invalid response from image generation. Please try again." },
        { status: 500 }
      );
    }

    const candidates = data.candidates;
    if (!candidates?.[0]?.content?.parts) {
      console.error("No candidates in response:", JSON.stringify(data).slice(0, 500));
      return NextResponse.json(
        { error: "No image generated. Please try again." },
        { status: 500 }
      );
    }

    const imagePart = candidates[0].content.parts.find(
      (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
    );

    if (!imagePart?.inlineData) {
      const partTypes = candidates[0].content.parts.map(
        (p: { text?: string; inlineData?: unknown }) =>
          p.text ? "text" : p.inlineData ? "image" : "unknown"
      );
      console.error("No image part found. Part types:", partTypes);
      return NextResponse.json(
        { error: "No image in response. The model returned text only. Please try again." },
        { status: 500 }
      );
    }

    const resultBase64 = imagePart.inlineData.data;
    const resultMime = imagePart.inlineData.mimeType || "image/png";

    return NextResponse.json({
      image: `data:${resultMime};base64,${resultBase64}`,
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

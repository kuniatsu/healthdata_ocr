import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AnalysisResult {
  date: string;
  items: Array<{
    name: string;
    value: string;
    unit: string;
  }>;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Determine MIME type
    const mimeType = file.type || "image/jpeg";

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt =
      "この健康診断書の画像から、測定日(YYYY-MM-DD)と、検査項目・測定値・単位を抽出し、指定のJSON形式のみを出力してください。";

    const response = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
        },
      },
      {
        text: systemPrompt + "\n\n返却形式:\n{\"date\": \"YYYY-MM-DD\", \"items\": [{\"name\": \"項目名\", \"value\": \"値\", \"unit\": \"単位\"}]}",
      },
    ]);

    // Extract the response text
    const responseText = response.response?.text() || "";

    // Parse JSON from response
    // Extract JSON from the response (it might contain extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to extract JSON from response", raw: responseText },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const result: AnalysisResult = JSON.parse(jsonMatch[0]);

    // Validate the result structure
    if (!result.date || !Array.isArray(result.items)) {
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: "Failed to analyze image", details: errorMessage },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

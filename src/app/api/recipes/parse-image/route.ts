import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genai } from "@/lib/gemini";
import { IMAGE_PARSE_SYSTEM, buildImageParsePrompt } from "@/lib/prompts";
import type { ParseResult } from "@/types/recipe";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "이미지 파일을 선택해주세요" },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "JPG, PNG, WebP 형식만 지원합니다" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "파일 크기는 10MB 이하만 가능합니다" },
      { status: 400 },
    );
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      temperature: 0.3,
      systemInstruction: IMAGE_PARSE_SYSTEM,
    },
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: file.type, data: base64 } },
          { text: buildImageParsePrompt() },
        ],
      },
    ],
  });

  const text = response.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "PARSE_FAILED", reason: "AI 응답에서 JSON을 추출할 수 없습니다" },
      { status: 422 },
    );
  }

  const parsed: ParseResult = JSON.parse(jsonMatch[0]);
  if ("error" in parsed) {
    return NextResponse.json(parsed, { status: 422 });
  }

  return NextResponse.json(parsed);
}

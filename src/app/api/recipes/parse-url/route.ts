import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genai } from "@/lib/gemini";
import { URL_PARSE_SYSTEM, buildUrlParsePrompt } from "@/lib/prompts";
import type { ParseResult } from "@/types/recipe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url } = body as { url?: string };

  if (!url || !/^https?:\/\/.+/.test(url)) {
    return NextResponse.json(
      { error: "유효한 URL을 입력해주세요" },
      { status: 400 },
    );
  }

  const pageRes = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CookingBook/1.0; +https://cookingbook.app)",
    },
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null);

  if (!pageRes?.ok) {
    return NextResponse.json(
      { error: "URL에 접근할 수 없습니다" },
      { status: 422 },
    );
  }

  const pageText = await pageRes.text();
  const trimmedText = pageText
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15_000);

  const response = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      temperature: 0.3,
      systemInstruction: URL_PARSE_SYSTEM,
    },
    contents: [
      { role: "user", parts: [{ text: buildUrlParsePrompt(trimmedText) }] },
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

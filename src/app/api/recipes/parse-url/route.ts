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

  // 네이버 블로그는 모바일 URL로 변환 (SPA 구조라 서버 fetch 시 콘텐츠가 비어있음)
  let fetchUrl = url;
  if (/blog\.naver\.com/.test(url) && !/m\.blog\.naver\.com/.test(url)) {
    fetchUrl = url.replace("blog.naver.com", "m.blog.naver.com");
  }

  const pageRes = await fetch(fetchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
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
  const baseUrl = new URL(fetchUrl);
  const trimmedText = pageText
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    // img 태그의 src를 [IMAGE: url] 형태로 보존
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_match, src) => {
      const imgUrl = src.startsWith("http") ? src : `${baseUrl.origin}${src}`;
      return ` [IMAGE: ${imgUrl}] `;
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15_000);

  let response;
  try {
    response = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        temperature: 0.3,
        systemInstruction: URL_PARSE_SYSTEM,
      },
      contents: [
        { role: "user", parts: [{ text: buildUrlParsePrompt(trimmedText) }] },
      ],
    });
  } catch (e: unknown) {
    const status = (e as { status?: number }).status;
    if (status === 429) {
      return NextResponse.json(
        { reason: "AI 요청 한도를 초과했어요. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { reason: "AI 분석 중 오류가 발생했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }

  const text = response.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { reason: "AI 응답에서 레시피를 추출할 수 없었어요. 다른 URL을 시도해주세요." },
      { status: 422 },
    );
  }

  const parsed: ParseResult = JSON.parse(jsonMatch[0]);
  if ("error" in parsed) {
    return NextResponse.json(parsed, { status: 422 });
  }

  return NextResponse.json(parsed);
}

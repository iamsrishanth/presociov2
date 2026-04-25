const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Call Gemini with a system prompt + user prompt.
 * Returns the raw text response.
 */
async function generateText(systemPrompt: string, userPrompt: string): Promise<string> {
  const url = `${BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      topP: 0.95,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data: GeminiResponse = await res.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Gemini returned empty response');
  }

  return responseText;
}

/**
 * Generate a cinematic video prompt for Wan 2.6 text-to-video.
 * Returns raw text — no JSON parsing needed.
 */
export async function generateVideoPrompt(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const raw = await generateText(systemPrompt, userPrompt);

  // Strip markdown code fences if the LLM added them
  const cleaned = raw
    .replace(/^```(?:text|markdown)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  return cleaned;
}

/**
 * Generate an Instagram caption from a prompt.
 * Truncates to 2,190 chars as a safety measure.
 */
export async function generateCaption(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const raw = await generateText(systemPrompt, userPrompt);

  // Safety truncation
  if (raw.length > 2190) {
    console.warn(`[Gemini] Caption truncated from ${raw.length} to 2190 chars`);
    return raw.slice(0, 2190).trimEnd() + '...';
  }

  return raw.trim();
}

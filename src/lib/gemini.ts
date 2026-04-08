import type { J2VMovie } from '@/types';

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
 * Generate a JSON2VIDEO Movie JSON from a prompt.
 * Parses the response as JSON and validates basic structure.
 */
export async function generateMovieJSON(
  systemPrompt: string,
  userPrompt: string
): Promise<J2VMovie> {
  const raw = await generateText(systemPrompt, userPrompt);

  // Strip markdown code fences if the LLM added them despite instructions
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Gemini returned invalid JSON for Movie JSON. Raw response (first 500 chars): ${cleaned.slice(0, 500)}`
    );
  }

  // Basic validation
  const movie = parsed as J2VMovie;
  if (!movie.scenes || !Array.isArray(movie.scenes) || movie.scenes.length === 0) {
    throw new Error('Generated Movie JSON has no scenes');
  }

  // Enforce resolution
  movie.resolution = 'instagram-story';
  movie.quality = 'high';

  // Validate scene durations sum
  const totalDuration = movie.scenes.reduce(
    (sum, scene) => sum + (scene.duration ?? 5),
    0
  );
  if (totalDuration > 90) {
    throw new Error(
      `Generated video duration ${totalDuration}s exceeds Instagram Reel max of 90s`
    );
  }

  return movie;
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

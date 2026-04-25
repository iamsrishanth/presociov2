import type {
  Wan26SubmitResponse,
  Wan26StatusResponse,
  Wan26GenerationParams,
} from '@/types';

const BASE_URL = 'https://api.aimlapi.com/v2';
const API_KEY = process.env.AIML_API_KEY!;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

/**
 * Submit a text-to-video generation task to Wan 2.6.
 * Returns the generation ID for polling.
 */
export async function generateVideo(
  params: Wan26GenerationParams
): Promise<string> {
  const url = `${BASE_URL}/generate/video/alibaba/generation`;

  const body = {
    model: 'alibaba/wan-2-6-t2v',
    prompt: params.prompt,
    aspect_ratio: params.aspect_ratio ?? '9:16',
    resolution: params.resolution ?? '1080p',
    duration: params.duration ?? 10,
    shot_type: params.shot_type ?? 'multi',
    generate_audio: params.generate_audio ?? true,
    ...(params.negative_prompt && { negative_prompt: params.negative_prompt }),
    ...(params.seed && { seed: params.seed }),
    ...(params.audio_url && { audio_url: params.audio_url }),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wan 2.6 submit failed (${res.status}): ${text}`);
  }

  const data: Wan26SubmitResponse = await res.json();

  if (!data.id) {
    throw new Error(
      `Wan 2.6 submit returned no generation ID: ${JSON.stringify(data)}`
    );
  }

  return data.id;
}

/**
 * Check the status of a video generation task.
 */
export async function getStatus(
  generationId: string
): Promise<Wan26StatusResponse> {
  const url = `${BASE_URL}/generate/video/alibaba/generation`;
  const res = await fetch(`${url}?generation_id=${generationId}`, {
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wan 2.6 status check failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Poll until generation is complete.
 * Returns the CDN URL of the generated video.
 * Throws on error or timeout.
 */
export async function pollUntilDone(
  generationId: string,
  maxAttempts = 60,
  intervalMs = 15_000
): Promise<{ url: string; creditsUsed?: number }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(intervalMs);

    const data = await getStatus(generationId);

    console.log(`[Wan 2.6] Attempt ${attempt}/${maxAttempts} — status: ${data.status}`);

    if (data.status === 'completed') {
      if (!data.video?.url) {
        throw new Error('Wan 2.6 done but no video URL returned');
      }

      return {
        url: data.video.url,
        creditsUsed: data.meta?.usage?.credits_used,
      };
    }

    if (data.status === 'error') {
      throw new Error(
        `Wan 2.6 generation error: ${data.error?.message ?? 'Unknown error'}`
      );
    }

    // queued or generating — continue polling
  }

  throw new Error(
    `Wan 2.6 generation timed out after ${(maxAttempts * intervalMs) / 1000}s`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

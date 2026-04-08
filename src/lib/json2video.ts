import type { J2VSubmitResponse, J2VStatusResponse, J2VMovie } from '@/types';

const BASE_URL = 'https://api.json2video.com/v2';
const API_KEY = process.env.JSON2VIDEO_API_KEY!;

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

/**
 * Submit a movie JSON to JSON2VIDEO for rendering.
 * Returns the project ID for polling.
 */
export async function submitMovie(movieJSON: J2VMovie): Promise<string> {
  const res = await fetch(`${BASE_URL}/movies`, {
    method: 'POST',
    headers,
    body: JSON.stringify(movieJSON),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSON2VIDEO submit failed (${res.status}): ${text}`);
  }

  const data: J2VSubmitResponse = await res.json();

  if (!data.success || !data.project) {
    throw new Error(`JSON2VIDEO submit returned no project ID: ${JSON.stringify(data)}`);
  }

  return data.project;
}

/**
 * Check the status of a rendering job.
 */
export async function getStatus(projectId: string): Promise<J2VStatusResponse> {
  const res = await fetch(`${BASE_URL}/movies?project=${projectId}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSON2VIDEO status check failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Poll until rendering is done.
 * Returns the CDN URL of the rendered video.
 * Throws on error or timeout.
 */
export async function pollUntilDone(
  projectId: string,
  maxAttempts = 30,
  intervalMs = 10_000
): Promise<{ url: string; width: number; height: number; duration: number }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(intervalMs);

    const data = await getStatus(projectId);
    const { movie } = data;

    console.log(`[JSON2VIDEO] Attempt ${attempt}/${maxAttempts} — status: ${movie.status}`);

    if (movie.status === 'done') {
      if (!movie.url) {
        throw new Error('JSON2VIDEO done but no URL returned');
      }

      // Validate Reel compliance
      if (movie.width !== 1080 || movie.height !== 1920) {
        console.warn(
          `[JSON2VIDEO] Warning: Resolution is ${movie.width}x${movie.height}, expected 1080x1920`
        );
      }
      if (movie.duration && movie.duration > 90) {
        throw new Error(
          `Video duration ${movie.duration}s exceeds Instagram Reel max of 90s`
        );
      }

      return {
        url: movie.url,
        width: movie.width ?? 1080,
        height: movie.height ?? 1920,
        duration: movie.duration ?? 0,
      };
    }

    if (movie.status === 'error') {
      throw new Error(`JSON2VIDEO render error: ${movie.message}`);
    }

    // pending or running — continue polling
  }

  throw new Error(`JSON2VIDEO render timed out after ${(maxAttempts * intervalMs) / 1000}s`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

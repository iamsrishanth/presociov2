import { NextRequest, NextResponse } from 'next/server';
import { submitMovie, pollUntilDone } from '@/lib/json2video';
import { postReel } from '@/lib/zernio';
import { generateMovieJSON, generateCaption } from '@/lib/gemini';
import {
  MOVIE_JSON_SYSTEM_PROMPT,
  buildMovieJSONPrompt,
  CAPTION_SYSTEM_PROMPT,
  buildCaptionPrompt,
} from '@/lib/prompts';
import { getTestMovieJSON, getTestCaption } from '@/lib/test-data';
import type { PipelineResult, UserInput } from '@/types';

export const maxDuration = 300; // 5 min serverless timeout (render can take a while)

/**
 * POST /api/pipeline
 *
 * Modes:
 *   - "test": Hardcoded Reel JSON + test caption (no LLM, no cost)
 *   - "full": LLM-generated Movie JSON + caption from user brief
 *
 * Stages:
 *   1. Generate Movie JSON (Gemini) — or use test data
 *   2. Render via JSON2VIDEO
 *   3. Generate caption (Gemini) — or use test data
 *   4. Post to Instagram via Zernio
 *   5. Return result
 */
export async function POST(req: NextRequest): Promise<NextResponse<PipelineResult>> {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: 'test' | 'full' = body.mode ?? 'test';
    const userInput: UserInput | undefined = body.input;

    let movieJSON;
    let caption;

    // ── STAGE 1: Generate or use test data ────────────────────────────
    if (mode === 'full') {
      if (!userInput) {
        return NextResponse.json(
          { status: 'error', error: 'Full mode requires "input" object with campaign brief' },
          { status: 400 }
        );
      }

      // Validate required fields
      const required: (keyof UserInput)[] = [
        'brand_name', 'campaign_objective', 'target_audience',
        'content_tone', 'key_messages', 'reel_topic', 'visual_style',
        'reel_duration_seconds', 'cta',
      ];
      const missing = required.filter((f) => !userInput[f]);
      if (missing.length > 0) {
        return NextResponse.json(
          { status: 'error', error: `Missing required fields: ${missing.join(', ')}` },
          { status: 400 }
        );
      }

      console.log('[Pipeline] Stage 1: Generating Movie JSON via Gemini...');
      const moviePrompt = buildMovieJSONPrompt(userInput);
      movieJSON = await generateMovieJSON(MOVIE_JSON_SYSTEM_PROMPT, moviePrompt);
      console.log(`[Pipeline] Movie JSON generated (${movieJSON.scenes.length} scenes)`);

      console.log('[Pipeline] Stage 3: Generating caption via Gemini...');
      const captionPrompt = buildCaptionPrompt(userInput);
      caption = await generateCaption(CAPTION_SYSTEM_PROMPT, captionPrompt);
      console.log(`[Pipeline] Caption generated (${caption.length} chars)`);
    } else {
      console.log('[Pipeline] Test mode — using hardcoded data');
      movieJSON = getTestMovieJSON();
      caption = getTestCaption();
    }

    // ── STAGE 2: Render video via JSON2VIDEO ──────────────────────────
    console.log('[Pipeline] Stage 2: Submitting to JSON2VIDEO...');
    const projectId = await submitMovie(movieJSON);
    console.log(`[Pipeline] Project ID: ${projectId}`);

    console.log('[Pipeline] Polling until render completes...');
    const video = await pollUntilDone(projectId);
    console.log(
      `[Pipeline] Video ready: ${video.url} (${video.width}x${video.height}, ${video.duration}s)`
    );

    // ── STAGE 4: Post to Instagram via Zernio ─────────────────────────
    console.log('[Pipeline] Stage 4: Posting to Instagram via Zernio...');
    const zernioResult = await postReel({
      caption,
      videoUrl: video.url,
      publishNow: true,
    });
    console.log(`[Pipeline] Posted! ID: ${zernioResult.post._id}`);

    // ── STAGE 5: Return result ────────────────────────────────────────
    return NextResponse.json({
      status: 'success',
      post_id: zernioResult.post._id,
      video_url: video.url,
      caption_preview: caption.slice(0, 125) + '...',
      caption,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Pipeline] Error:', message);

    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}

/**
 * GET /api/pipeline — Health check + env validation
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'presocio-reel-publisher',
    stages: {
      json2video: !!process.env.JSON2VIDEO_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      gemini_model: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
      zernio: !!process.env.ZERNIO_API_KEY,
      zernio_account: !!process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { generateVideo, pollUntilDone } from '@/lib/wan26';
import { postReel } from '@/lib/zernio';
import { generateVideoPrompt, generateCaption } from '@/lib/gemini';
import {
  VIDEO_PROMPT_SYSTEM_PROMPT,
  buildVideoPromptPrompt,
  CAPTION_SYSTEM_PROMPT,
  buildCaptionPrompt,
} from '@/lib/prompts';
import { getTestVideoPrompt, getTestCaption } from '@/lib/test-data';
import type { PipelineResult, UserInput } from '@/types';

export const maxDuration = 300; // 5 min serverless timeout (render can take a while)

/**
 * POST /api/pipeline
 *
 * Modes:
 *   - "test": Hardcoded video prompt + test caption (no LLM, no cost)
 *   - "full": LLM-generated video prompt + caption from user brief
 *
 * Stages:
 *   1. Generate video prompt (Gemini) — or use test data
 *   2. Generate video via Wan 2.6 (AIML API)
 *   3. Generate caption (Gemini) — or use test data
 *   4. Post to Instagram via Zernio
 *   5. Return result
 */
export async function POST(req: NextRequest): Promise<NextResponse<PipelineResult>> {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: 'test' | 'full' = body.mode ?? 'test';
    const userInput: UserInput | undefined = body.input;

    let videoPrompt: string;
    let caption: string;

    // ── STAGE 1: Generate video prompt or use test data ─────────────
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

      console.log('[Pipeline] Stage 1: Generating video prompt via Gemini...');
      const promptInput = buildVideoPromptPrompt(userInput);
      videoPrompt = await generateVideoPrompt(VIDEO_PROMPT_SYSTEM_PROMPT, promptInput);
      console.log(`[Pipeline] Video prompt generated (${videoPrompt.length} chars)`);

      console.log('[Pipeline] Stage 3: Generating caption via Gemini...');
      const captionPrompt = buildCaptionPrompt(userInput);
      caption = await generateCaption(CAPTION_SYSTEM_PROMPT, captionPrompt);
      console.log(`[Pipeline] Caption generated (${caption.length} chars)`);
    } else {
      console.log('[Pipeline] Test mode — using hardcoded data');
      videoPrompt = getTestVideoPrompt();
      caption = getTestCaption();
    }

    // ── STAGE 2: Generate video via Wan 2.6 ─────────────────────────
    console.log('[Pipeline] Stage 2: Submitting to Wan 2.6 (AIML API)...');
    const durationMap: Record<number, 5 | 10 | 15> = {
      15: 15,
      30: 15, // Wan 2.6 max is 15s per clip
      60: 15,
    };
    const wanDuration = durationMap[userInput?.reel_duration_seconds ?? 15] ?? 10;

    const generationId = await generateVideo({
      prompt: videoPrompt,
      aspect_ratio: '9:16',
      resolution: '1080p',
      duration: wanDuration,
      shot_type: 'multi',
      generate_audio: true,
    });
    console.log(`[Pipeline] Generation ID: ${generationId}`);

    console.log('[Pipeline] Polling until generation completes...');
    const video = await pollUntilDone(generationId);
    console.log(`[Pipeline] Video ready: ${video.url}`);

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
      generation_id: generationId,
      credits_used: video.creditsUsed,
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
      wan26: !!process.env.AIML_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      gemini_model: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
      zernio: !!process.env.ZERNIO_API_KEY,
      zernio_account: !!process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID,
    },
  });
}

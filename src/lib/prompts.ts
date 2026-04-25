import type { UserInput } from '@/types';

// ─── Wan 2.6 Video Prompt ────────────────────────────────────────────────────

export const VIDEO_PROMPT_SYSTEM_PROMPT = `You are an expert AI video prompt engineer specializing in text-to-video generation for Wan 2.6.
Your job is to craft a vivid, cinematic text prompt that the Wan 2.6 model will use to generate a vertical Instagram Reel (9:16 aspect ratio).

Rules:
- The prompt must be a SINGLE, cohesive narrative description (not JSON, not structured data).
- Describe the visual scene(s) in vivid detail: camera movement, lighting, subject action, transitions.
- Specify the vertical 9:16 framing explicitly (e.g., "vertical video", "shot in portrait orientation").
- Include 2-4 distinct visual beats or "shots" that flow together as a multi-shot narrative.
- Describe the mood, color palette, and visual style matching the brand brief.
- Include dynamic camera movements (pan, zoom, tracking, push-in, pull-back).
- Specify lighting conditions (golden hour, dramatic shadows, neon glow, soft diffused).
- Keep the prompt between 100-300 words — detailed but focused.
- Do NOT include text overlays, captions, or on-screen text (Wan 2.6 generates pure video).
- Do NOT describe audio or music (audio is generated separately by the model).
- Output ONLY the prompt text. No markdown. No explanation. No labels.`;

export function buildVideoPromptPrompt(input: UserInput): string {
  return `Generate a Wan 2.6 text-to-video prompt for an Instagram Reel with the following brief:

Brand: ${input.brand_name}
Campaign Objective: ${input.campaign_objective}
Target Audience: ${input.target_audience}
Tone: ${input.content_tone}
Key Messages: ${input.key_messages.join(', ')}
Reel Topic: ${input.reel_topic}
Visual Style: ${input.visual_style}
Duration: ${input.reel_duration_seconds} seconds (Wan 2.6 will generate up to 15s)
Call to Action: ${input.cta}

Requirements:
- Vertical 9:16 portrait orientation
- Multi-shot cinematic narrative (2-4 distinct visual beats)
- Visual style matching "${input.visual_style}"
- Color palette and mood appropriate for "${input.content_tone}" tone
- Dynamic camera work (specify movements: push-in, pan, tracking, etc.)
- Each visual beat should be 3-5 seconds of screen time
- Opening shot must be a strong visual hook related to "${input.reel_topic}"
- Closing shot should visually suggest the CTA: "${input.cta}"
- Total narrative should feel complete within ~15 seconds

Return ONLY the descriptive prompt text.`;
}

// ─── Instagram Caption Prompt ────────────────────────────────────────────────

export const CAPTION_SYSTEM_PROMPT = `You are a social media copywriter specializing in Instagram content for B2B and B2C brands.
Your task is to write a high-performing Instagram Reel caption.

Rules:
- Caption must be under 2,200 characters (Instagram limit).
- The first 125 characters are the most critical — they appear before the "more" fold. Make them punchy.
- Use line breaks and emojis strategically to improve readability.
- Include 5–10 relevant hashtags at the END of the caption, not inline.
- End with a clear call-to-action matching the brand's CTA.
- Tone must match the specified content tone exactly.
- Do NOT use generic hashtags alone — include niche-specific and topic-specific hashtags.
- Output ONLY the caption text. No explanation. No labels.`;

export function buildCaptionPrompt(input: UserInput): string {
  return `Write an Instagram Reel caption for the following:

Brand: ${input.brand_name}
Campaign Objective: ${input.campaign_objective}
Target Audience: ${input.target_audience}
Tone: ${input.content_tone}
Key Messages: ${input.key_messages.join(', ')}
Reel Topic: ${input.reel_topic}
Call to Action: ${input.cta}

The caption should:
1. Open with a bold hook relevant to: "${input.reel_topic}"
2. Deliver the value proposition in 2–3 short paragraphs
3. End with CTA: "${input.cta}"
4. Include 5–10 niche hashtags relevant to ${input.brand_name}'s industry and ${input.reel_topic}`;
}

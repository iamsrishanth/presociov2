// ─── User Input (Campaign Brief) ─────────────────────────────────────────────

export interface UserInput {
  brand_name: string;
  campaign_objective: string;
  target_audience: string;
  content_tone: 'professional' | 'casual' | 'witty' | 'inspirational';
  key_messages: string[];
  reel_topic: string;
  visual_style: string;
  background_music_mood: string;
  reel_duration_seconds: 15 | 30 | 60;
  cta: string;
}

// ─── Wan 2.6 (Text-to-Video) Types ───────────────────────────────────────────

export interface Wan26GenerationParams {
  prompt: string;
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  resolution?: '720p' | '1080p';
  duration?: 5 | 10 | 15;
  shot_type?: 'single' | 'multi';
  generate_audio?: boolean;
  negative_prompt?: string;
  seed?: number;
  audio_url?: string;
}

export interface Wan26SubmitResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'error';
  meta?: {
    usage?: {
      credits_used: number;
    };
  };
}

export interface Wan26StatusResponse {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'error';
  video?: {
    url: string;
  } | null;
  error?: {
    name: string;
    message: string;
  } | null;
  meta?: {
    usage?: {
      credits_used: number;
    };
  } | null;
}

// ─── JSON2VIDEO Types (legacy — kept for reference) ──────────────────────────

export interface J2VTextElement {
  type: 'text';
  text: string;
  style?: string;
  'font-family'?: string;
  'font-size'?: number;
  color?: string;
  'background-color'?: string;
  'font-weight'?: 'bold' | 'normal';
  'text-align'?: 'center' | 'left' | 'right';
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  position?: string;
  'fade-in'?: number;
  'fade-out'?: number;
  duration?: number;
  start?: number;
}

export interface J2VImageElement {
  type: 'image';
  src?: string;
  model?: string;
  prompt?: string;
  'aspect-ratio'?: 'horizontal' | 'vertical' | 'squared';
  resize?: 'cover' | 'fill' | 'fit' | 'contain';
  duration?: number;
  zoom?: number;
  pan?: string;
  'fade-in'?: number;
  'fade-out'?: number;
}

export interface J2VVideoElement {
  type: 'video';
  src: string;
  duration?: number;
  resize?: 'cover' | 'fill' | 'fit' | 'contain';
  'fade-in'?: number;
  'fade-out'?: number;
}

export type J2VElement = J2VTextElement | J2VImageElement | J2VVideoElement;

export interface J2VScene {
  comment?: string;
  duration?: number;
  'background-color'?: string;
  elements: J2VElement[];
}

export interface J2VMovie {
  resolution: string;
  quality: string;
  scenes: J2VScene[];
  comment?: string;
}

// ─── JSON2VIDEO API Responses ────────────────────────────────────────────────

export interface J2VSubmitResponse {
  success: boolean;
  project: string;
  timestamp: string;
}

export interface J2VStatusResponse {
  success: boolean;
  movie: {
    success: boolean;
    status: 'pending' | 'running' | 'done' | 'error';
    message: string;
    project: string;
    url: string | null;
    created_at: string;
    ended_at: string | null;
    duration?: number;
    size?: number;
    width?: number;
    height?: number;
    rendering_time?: number;
  };
  remaining_quota: {
    time: number;
  };
}

// ─── Zernio Types ────────────────────────────────────────────────────────────

export interface ZernioPlatform {
  platform: 'instagram';
  accountId: string;
  platformSpecificData: {
    contentType: 'reels';
    shareToFeed: boolean;
    audioName?: string;
    thumbOffset?: number;
  };
}

export interface ZernioPostRequest {
  content: string;
  mediaItems: Array<{ type: 'video'; url: string }>;
  platforms: ZernioPlatform[];
  publishNow: boolean;
}

export interface ZernioPostResponse {
  post: {
    _id: string;
    status: string;
    [key: string]: unknown;
  };
}

// ─── Pipeline Result ─────────────────────────────────────────────────────────

export interface PipelineResult {
  status: 'success' | 'error';
  post_id?: string;
  video_url?: string;
  caption_preview?: string;
  caption?: string;
  error?: string;
  stage?: string;
  generation_id?: string;
  credits_used?: number;
}

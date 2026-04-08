# Presocio — Instagram Reel Auto-Publisher

AI-powered pipeline that takes a brand brief, generates a vertical Instagram Reel via JSON2VIDEO, writes a caption via Gemini, and publishes it to Instagram via Zernio — all without manual editing.

## Pipeline

```
User Input (Campaign Brief)
        │
        ▼
┌─────────────────────────┐
│  Stage 1: Gemini Flash  │  → Movie JSON (video scenes)
│  + Caption Prompt       │  → Instagram caption + hashtags
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  Stage 2: JSON2VIDEO    │  → Render 1080×1920 MP4
│  POST /v2/movies        │  → Poll until status = "done"
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  Stage 3: Zernio API    │  → POST /v1/posts (contentType: "reels")
│                         │  → Publish immediately or schedule
└─────────────────────────┘
        │
        ▼
    Result: post_id + video_url + caption
```

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```env
JSON2VIDEO_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3-flash-preview
ZERNIO_API_KEY=sk_your_key_here
ZERNIO_INSTAGRAM_ACCOUNT_ID=your_account_id_here
```

To find your Instagram account ID:

```bash
npm run dev
curl http://localhost:3000/api/accounts
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Modes

| Mode | Description | LLM Cost |
|------|-------------|----------|
| **Test** | Hardcoded 3-scene Reel + test caption | Free |
| **Full** | AI-generated Movie JSON + caption from campaign brief | Gemini API calls |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pipeline` | `POST` | Run the full pipeline (test or full mode) |
| `/api/pipeline` | `GET` | Health check + env validation |
| `/api/accounts` | `GET` | List connected Zernio social accounts |

### POST /api/pipeline

**Test mode:**
```json
{ "mode": "test" }
```

**Full mode:**
```json
{
  "mode": "full",
  "input": {
    "brand_name": "Acme Corp",
    "campaign_objective": "Increase brand awareness",
    "target_audience": "Marketing professionals, 25-45",
    "content_tone": "professional",
    "key_messages": ["Save 10 hours a week", "AI-powered automation"],
    "reel_topic": "How AI saves 10hrs/week",
    "visual_style": "minimalist dark tech",
    "background_music_mood": "upbeat",
    "reel_duration_seconds": 30,
    "cta": "Follow for more AI tips"
  }
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Video Rendering | JSON2Video API |
| Caption Generation | Google Gemini 3 Flash |
| Social Publishing | Zernio API |
| UI | React (inline styles, dark theme) |

## Project Structure

```
src/
├── types/index.ts            # TypeScript types
├── lib/
│   ├── json2video.ts         # JSON2VIDEO client (submit + poll)
│   ├── zernio.ts             # Zernio client (post + list accounts)
│   ├── gemini.ts             # Gemini client (Movie JSON + caption)
│   ├── prompts.ts            # System + user prompt templates
│   └── test-data.ts          # Hardcoded test Reel JSON
└── app/
    ├── layout.tsx            # Root layout
    ├── page.tsx              # UI with mode toggle + campaign brief form
    └── api/
        ├── pipeline/route.ts # Main pipeline endpoint
        └── accounts/route.ts # List connected accounts
```

## Instagram Reel Compliance

- Resolution: 1080×1920 px (9:16)
- Duration: ≤ 90 seconds
- Format: MP4 (H.264)
- Caption: ≤ 2,200 characters
- Account type: Business or Creator (required)

## License

Private — Presocio MVP

# Presocio — Instagram Reel Auto-Publisher

AI-powered pipeline that takes a brand brief, generates a vertical Instagram Reel via **Wan 2.6 text-to-video** (AIML API), writes a caption via Gemini, and publishes it to Instagram via Zernio — all without manual editing.

## Pipeline

```
User Input (Campaign Brief)
        │
        ▼
┌─────────────────────────┐
│  Stage 1: Gemini Flash  │  → Cinematic video prompt (text)
│  + Caption Prompt       │  → Instagram caption + hashtags
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│  Stage 2: Wan 2.6 T2V   │  → Generate 1080×1920 MP4 via AIML API
│  (AIML API)             │  → Poll until status = "done"
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
AIML_API_KEY=your_key_here
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
| **Test** | Hardcoded video prompt + test caption | Free |
| **Full** | AI-generated prompt from campaign brief + caption | Gemini API calls |

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
| Video Generation | Wan 2.6 T2V (AIML API) |
| Prompt Generation | Google Gemini 3 Flash |
| Social Publishing | Zernio API |
| UI | React (inline styles, dark theme) |

## Project Structure

```
src/
├── types/index.ts            # TypeScript types
├── lib/
│   ├── wan26.ts              # Wan 2.6 client (submit + poll)
│   ├── zernio.ts             # Zernio client (post + list accounts)
│   ├── gemini.ts             # Gemini client (video prompt + caption)
│   ├── prompts.ts            # System + user prompt templates
│   └── test-data.ts          # Hardcoded test video prompt
└── app/
    ├── layout.tsx            # Root layout
    ├── page.tsx              # UI with mode toggle + campaign brief form
    └── api/
        ├── pipeline/route.ts # Main pipeline endpoint
        └── accounts/route.ts # List connected accounts
```

## Instagram Reel Compliance

- Resolution: 1080×1920 px (9:16)
- Duration: 5, 10, or 15 seconds (Wan 2.6 constraint)
- Format: MP4
- Caption: ≤ 2,200 characters
- Account type: Business or Creator (required)

## License

Private — Presocio MVP

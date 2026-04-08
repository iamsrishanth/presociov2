import type { ZernioPostRequest, ZernioPostResponse } from '@/types';

const BASE_URL = 'https://zernio.com/api/v1';
const API_KEY = process.env.ZERNIO_API_KEY!;
const INSTAGRAM_ACCOUNT_ID = process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID!;

/**
 * Post a Reel to Instagram via Zernio.
 */
export async function postReel(params: {
  caption: string;
  videoUrl: string;
  publishNow?: boolean;
}): Promise<ZernioPostResponse> {
  const body: ZernioPostRequest = {
    content: params.caption,
    mediaItems: [{ type: 'video', url: params.videoUrl }],
    platforms: [
      {
        platform: 'instagram',
        accountId: INSTAGRAM_ACCOUNT_ID,
        platformSpecificData: {
          contentType: 'reels',
          shareToFeed: true,
          thumbOffset: 0,
        },
      },
    ],
    publishNow: params.publishNow ?? true,
  };

  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zernio post failed (${res.status}): ${text}`);
  }

  const data: ZernioPostResponse = await res.json();

  if (!data.post?._id) {
    throw new Error(`Zernio returned no post ID: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * List connected Instagram accounts (for debugging / setup).
 */
export async function listAccounts(): Promise<
  Array<{ _id: string; platform: string; username?: string }>
> {
  const res = await fetch(`${BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zernio accounts list failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.accounts ?? [];
}

import { NextResponse } from 'next/server';
import { listAccounts } from '@/lib/zernio';

/**
 * GET /api/accounts
 * Lists all connected social accounts via Zernio.
 * Use this to find your Instagram account ID.
 */
export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({ accounts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { InquiryPayload } from '@/lib/directus/types';

export async function POST(request: Request) {
  const payload = (await request.json()) as InquiryPayload;

  if (!payload.name || !payload.email || !payload.message) {
    return NextResponse.json({ error: 'Missing required inquiry fields.' }, { status: 400 });
  }

  // Directus inquiry creation will be enabled after CMS credentials and permissions are configured.
  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import type { InquiryPayload } from '@/lib/directus/types';

const MAX_FIELD_LENGTH = 5_000;

export async function POST(request: Request) {
  let payload: InquiryPayload;

  try {
    payload = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid inquiry payload.' }, { status: 400 });
  }

  if (!payload.name?.trim() || !payload.email?.trim() || !payload.message?.trim()) {
    return NextResponse.json({ error: 'Missing required inquiry fields.' }, { status: 400 });
  }

  const values = [payload.name, payload.email, payload.company, payload.phone, payload.message];
  if (values.some((value) => value && value.length > MAX_FIELD_LENGTH)) {
    return NextResponse.json({ error: 'Inquiry field is too long.' }, { status: 400 });
  }

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!directusUrl) {
    return NextResponse.json({ error: 'Inquiry service is not configured.' }, { status: 503 });
  }

  const token = process.env.DIRECTUS_STATIC_TOKEN;
  const response = await fetch(`${directusUrl.replace(/\/$/, '')}/items/inquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      customer_name: payload.name.trim(),
      email: payload.email.trim(),
      company_name: payload.company?.trim() || null,
      phone: payload.phone?.trim() || null,
      message: payload.message.trim(),
      source_page: payload.sourcePath || null,
      product_interested: payload.productSlug || null,
      locale: payload.locale || null,
      status: 'pending'
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Inquiry service is temporarily unavailable.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

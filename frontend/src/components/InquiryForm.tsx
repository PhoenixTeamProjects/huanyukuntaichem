'use client';

import { useState } from 'react';
import type { Locale } from '@/config/i18n';
import type { Messages } from '@/lib/i18n/messages';

export default function InquiryForm({
  locale,
  messages,
  sourcePath,
  productSlug
}: {
  locale: Locale;
  messages: Messages;
  sourcePath: string;
  productSlug?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    const formData = new FormData(event.currentTarget);

    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        sourcePath,
        productSlug,
        locale
      })
    });

    setStatus(response.ok ? 'sent' : 'error');
    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <form className="form" onSubmit={submitInquiry}>
      <label className="field">
        {messages.form.name}
        <input name="name" required />
      </label>
      <label className="field">
        {messages.form.email}
        <input name="email" type="email" required />
      </label>
      <label className="field">
        {messages.form.company}
        <input name="company" />
      </label>
      <label className="field">
        {messages.form.phone}
        <input name="phone" />
      </label>
      <label className="field">
        {messages.form.message}
        <textarea name="message" required />
      </label>
      <button className="button" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? messages.form.sending : messages.cta.sendInquiry}
      </button>
      {status === 'sent' ? <p>{messages.form.sent}</p> : null}
      {status === 'error' ? <p>{messages.form.error}</p> : null}
    </form>
  );
}

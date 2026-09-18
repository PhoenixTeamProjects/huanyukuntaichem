'use client';

import { useState } from 'react';
import type { Locale } from '@/config/i18n';
import type { Messages } from '@/lib/i18n/messages';

export default function InquiryForm({
  locale,
  messages,
  sourcePath,
  productSlug,
  variant = 'default'
}: {
  locale: Locale;
  messages: Messages;
  sourcePath: string;
  productSlug?: string;
  variant?: 'default' | 'contact';
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    const formData = new FormData(event.currentTarget);
    const country = formData.get('country');
    const productInterest = formData.get('productInterest');
    const inquiryMessage = formData.get('message');
    const message = variant === 'contact'
      ? [`Country / Region: ${country || 'Not provided'}`, `Product interest: ${productInterest || 'Not provided'}`, '', inquiryMessage].join('\n')
      : inquiryMessage;

    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        message,
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
    <form className={`form${variant === 'contact' ? ' contact-inquiry-form' : ''}`} onSubmit={submitInquiry}>
      <label className="field">
        {messages.form.name}
        <input name="name" required />
      </label>
      <label className="field">
        {messages.form.company}
        <input name="company" />
      </label>
      {variant === 'contact' ? <label className="field">
        Country / Region
        <input name="country" autoComplete="country-name" placeholder="Your country or region" />
      </label> : null}
      <label className="field">
        {messages.form.phone}
        <input name="phone" inputMode="tel" autoComplete="tel" placeholder={variant === 'contact' ? '+86 181 8260 2513' : undefined} />
      </label>
      <label className="field">
        {messages.form.email}
        <input name="email" type="email" autoComplete="email" required placeholder={variant === 'contact' ? 'Your email address' : undefined} />
      </label>
      {variant === 'contact' ? <label className="field">
        Product interest
        <select name="productInterest" defaultValue="">
          <option value="" disabled>Select a product direction</option>
          <option>Fuel Additives</option>
          <option>Lubricant Additives</option>
          <option>Lubricant Additive Packages</option>
          <option>OEM / Private Label</option>
          <option>Technical Support</option>
        </select>
      </label> : null}
      <label className="field">
        {messages.form.message}
        <textarea name="message" required placeholder={variant === 'contact' ? 'Describe the application, operating conditions, target performance, destination market and any packaging requirements.' : undefined} />
      </label>
      <button className="button" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? messages.form.sending : messages.cta.sendInquiry}
      </button>
      {status === 'sent' ? <p>{messages.form.sent}</p> : null}
      {status === 'error' ? <p>{messages.form.error}</p> : null}
    </form>
  );
}

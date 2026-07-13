"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TOPICS = [
  "Sizing & ceiling height",
  "Delivery & freight",
  "Order support",
  "Bulk / university order",
  "Something else",
];

/**
 * Frontend-only contact form (Milestone 1). Submission is simulated locally —
 * Milestone 2 wires this to a real endpoint.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink">
          Thanks — we&apos;ve got your message
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          A member of our team will reply within one business day. (This is a
          preview form — no message was actually sent yet.)
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required autoComplete="name" className={inputClass} />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone (optional)" htmlFor="phone">
            <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
          </Field>
          <Field label="Topic" htmlFor="topic">
            <select id="topic" name="topic" className={inputClass} defaultValue={TOPICS[0]}>
              {TOPICS.map((t) => (
                <option key={t} value={t} className="bg-panel text-ink">
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Message" htmlFor="message">
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Tell us how we can help you."
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full">
          Send message <Send className="h-4 w-4" />
        </Button>
        <p className="text-center text-xs text-muted">
          We reply within one business day. We never share your details.
        </p>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-brand-blue/10 bg-brand-blue/[0.04] px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-brand-red/50 focus:outline-none focus:ring-2 focus:ring-brand-red/20";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

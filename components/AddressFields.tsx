"use client";

import { useId, useState } from "react";
import { US_STATES, US_CITY_NAMES, CITY_TO_STATE, CITY_TO_ZIP, STREET_SUGGESTIONS } from "@/lib/us-locations";

export interface Address {
  line1: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Address inputs where street and city can be typed OR selected (native
 * datalists of US streets/cities), and picking a known city auto-fills the
 * state. Renders `name`d inputs so it works inside a plain server-action form,
 * and calls `onChange` so controlled parents (checkout) can sync.
 */
export function AddressFields({
  defaults,
  onChange,
  required,
}: {
  defaults: Address;
  onChange?: (addr: Address) => void;
  required?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const [addr, setAddr] = useState<Address>(defaults);

  function patch(next: Partial<Address>) {
    const merged = { ...addr, ...next };
    // Auto-fill state + ZIP when a recognised city is chosen.
    if (next.city !== undefined) {
      const key = next.city.trim().toLowerCase();
      const st = CITY_TO_STATE[key];
      if (st) merged.state = st;
      const zip = CITY_TO_ZIP[key];
      // Only fill ZIP if the user hasn't typed one yet, so we never clobber input.
      if (zip && !addr.zip.trim()) merged.zip = zip;
    }
    setAddr(merged);
    onChange?.(merged);
  }

  return (
    <div className="space-y-5">
      <div>
        <Label required={required}>Street address</Label>
        <input
          name="line1"
          list={`streets-${uid}`}
          required={required}
          value={addr.line1}
          onChange={(e) => patch({ line1: e.target.value })}
          placeholder="123 Main St"
          className={inputCls}
        />
        <datalist id={`streets-${uid}`}>
          {STREET_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label required={required}>City</Label>
          <input
            name="city"
            list={`cities-${uid}`}
            required={required}
            value={addr.city}
            onChange={(e) => patch({ city: e.target.value })}
            placeholder="Start typing…"
            className={inputCls}
          />
          <datalist id={`cities-${uid}`}>
            {US_CITY_NAMES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <Label required={required}>State</Label>
          <select
            name="state"
            required={required}
            value={addr.state}
            onChange={(e) => patch({ state: e.target.value })}
            className={inputCls}
          >
            <option value="">Select…</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label required={required}>ZIP</Label>
          <input
            name="zip"
            required={required}
            value={addr.zip}
            onChange={(e) => patch({ zip: e.target.value })}
            placeholder="ZIP"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required && <span className="text-brand-red-700"> *</span>}
    </label>
  );
}

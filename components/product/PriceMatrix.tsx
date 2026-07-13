import { SIZES, HEIGHTS, BASE_PRICES } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

/**
 * The nine base prices as a size × height grid. Purely presentational — every
 * value is resolved from BASE_PRICES so pricing stays single-sourced.
 */
export function PriceMatrix() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-blue/[0.08] bg-panel shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-brand-blue/[0.08] text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-6 py-4 font-medium">Size</th>
              {HEIGHTS.map((h) => (
                <th key={h.id} className="px-6 py-4 text-right font-medium">
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size) => (
              <tr key={size.id} className="border-b border-brand-blue/[0.08] last:border-0">
                <td className="px-6 py-4">
                  <p className="font-medium text-ink">{size.label}</p>
                  <p className="text-xs text-muted">{size.dimensions}</p>
                </td>
                {HEIGHTS.map((h) => (
                  <td
                    key={h.id}
                    className="px-6 py-4 text-right font-display text-base font-semibold text-ink"
                  >
                    {formatPrice(BASE_PRICES[size.id][h.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-brand-blue/[0.08] px-6 py-3.5 text-xs text-muted">
        Base prices shown. Wood finish upcharges and sales tax are applied at checkout.
      </p>
    </div>
  );
}

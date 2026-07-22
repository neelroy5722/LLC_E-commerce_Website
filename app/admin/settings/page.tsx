import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { AdminPasswordForm } from "@/components/admin/AdminPasswordForm";
import { prisma } from "@/lib/db";
import { getSetting, getFreightCents } from "@/lib/settings";
import { formatCents } from "@/lib/money";
import {
  updateSettingsAction,
  updateCeilingRulesAction,
  updateTaxRatesAction,
  addTaxRateAction,
  deleteTaxRateAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const [freightCents, taxMode, taxRates, ceilingRules] = await Promise.all([
    getFreightCents(),
    getSetting("tax_mode", "table"),
    prisma.taxRate.findMany({ orderBy: { state: "asc" } }),
    prisma.ceilingRule.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted">Your account, freight, sales tax, and the ceiling-height recommendation logic.</p>
      </div>

      {/* Admin account password */}
      <AdminPasswordForm />

      {/* Freight & tax mode */}
      <form action={updateSettingsAction} className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Freight &amp; tax mode</h2>
          <SubmitButton savedLabel="Saved"><Save className="h-4 w-4" /> Save</SubmitButton>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Flat freight (USD)</label>
            <div className="inline-flex w-full items-center gap-1 rounded-xl border border-brand-blue/12 bg-panel px-3">
              <span className="text-muted">$</span>
              <input name="freight_dollars" type="number" min={0} defaultValue={Math.round(freightCents / 100)}
                className="w-full bg-transparent py-2.5 text-ink outline-none" />
            </div>
            <p className="mt-1 text-xs text-muted">Currently {formatCents(freightCents)} — placeholder until live rates (M3).</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">Sales-tax mode</label>
            <select name="tax_mode" defaultValue={taxMode}
              className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky">
              <option value="table">Data-driven state table</option>
              <option value="stripe">Stripe Tax (requires keys)</option>
            </select>
            <p className="mt-1 text-xs text-muted">Calculated at checkout from the shipping address.</p>
          </div>
        </div>
      </form>

      {/* State tax rates — rates grid + add form combined in one card.
          The save button + rate inputs live in one form; each delete is its own
          independent form (targeted by the row's delete button via the `form`
          attribute) so removing a state always works and never triggers a save. */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">State tax rates</h2>
            <p className="text-sm text-muted">Editable rates applied by shipping state at checkout.</p>
          </div>
          <Button type="submit" form="save-tax-rates" size="sm">
            <Save className="h-4 w-4" /> Save all rates
          </Button>
        </div>

        <form id="save-tax-rates" action={updateTaxRatesAction}>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {taxRates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-xl border border-brand-blue/[0.08] bg-panel px-3 py-2"
              >
                <span className="w-24 shrink-0 truncate text-sm font-medium text-ink">
                  {t.state === "*" ? "Default (all)" : t.state}
                </span>
                <input
                  name={`tax_${t.id}`}
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={t.ratePercent}
                  className="w-full min-w-0 rounded-lg border border-brand-blue/12 bg-night px-2 py-1 text-right text-sm text-ink outline-none focus:border-brand-sky"
                />
                <span className="text-xs text-muted">%</span>
                {t.state === "*" ? (
                  <button
                    type="button"
                    disabled
                    aria-label="The default rate can't be removed"
                    title="The default rate can't be removed"
                    className="shrink-0 cursor-not-allowed text-muted/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    form={`del-tax-${t.id}`}
                    className="shrink-0 text-muted hover:text-brand-red-600"
                    title={`Remove ${t.state}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </form>

        {/* Independent per-row delete forms (siblings, not nested). */}
        {taxRates
          .filter((t) => t.state !== "*")
          .map((t) => (
            <form key={t.id} id={`del-tax-${t.id}`} action={deleteTaxRateAction} className="hidden">
              <input type="hidden" name="id" value={t.id} />
            </form>
          ))}

        {/* Add a state rate — combined into the same card. */}
        <div className="mt-6 border-t border-brand-blue/[0.08] pt-6">
          <h3 className="text-sm font-semibold text-ink">Add a state rate</h3>
          <form action={addTaxRateAction} className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-brand-blue/12 p-4">
            <div>
              <label className="mb-1 block text-xs text-muted">State (2-letter)</label>
              <input name="state" maxLength={2} placeholder="e.g. NC"
                className="w-24 rounded-lg border border-brand-blue/12 bg-panel px-2 py-1.5 text-sm uppercase text-ink outline-none focus:border-brand-sky" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Rate %</label>
              <input name="ratePercent" type="number" step="0.01" min={0} placeholder="0.00"
                className="w-24 rounded-lg border border-brand-blue/12 bg-panel px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-sky" />
            </div>
            <SubmitButton variant="outline" savedLabel="Added"><Plus className="h-4 w-4" /> Add / update state</SubmitButton>
          </form>
        </div>
      </div>

      {/* Editable ceiling thresholds */}
      <form action={updateCeilingRulesAction} className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Ceiling-height thresholds</h2>
            <p className="text-sm text-muted">Tune the recommendation logic — no redeploy needed.</p>
          </div>
          <SubmitButton savedLabel="Saved"><Save className="h-4 w-4" /> Save thresholds</SubmitButton>
        </div>
        <div className="mt-5 space-y-3">
          {ceilingRules.map((r) => (
            <div key={r.id} className="grid gap-3 rounded-xl border border-brand-blue/[0.08] bg-panel p-4 sm:grid-cols-[8rem_9rem_1fr]">
              <div>
                <label className="mb-1 block text-xs text-muted">Recommend</label>
                <input name={`ceil_label_${r.id}`} defaultValue={r.label}
                  className="w-full rounded-lg border border-brand-blue/12 bg-night px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-sky" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">When ceiling ≥ (ft)</label>
                <input name={`ceil_min_${r.id}`} type="number" step="0.01" min={0} defaultValue={r.minCeilingFt}
                  className="w-full rounded-lg border border-brand-blue/12 bg-night px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-sky" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Rationale</label>
                <input name={`ceil_rationale_${r.id}`} defaultValue={r.rationale}
                  className="w-full rounded-lg border border-brand-blue/12 bg-night px-2 py-1.5 text-sm text-ink outline-none focus:border-brand-sky" />
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

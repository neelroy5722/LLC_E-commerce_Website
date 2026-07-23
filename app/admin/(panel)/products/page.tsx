import { Save, Plus, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { prisma } from "@/lib/db";
import { ImageManager, type ImageCell } from "@/components/admin/ImageManager";
import { variantImagePath } from "@/lib/catalog";
import {
  updatePricesAction,
  updateWoodsAction,
  deleteWoodAction,
  addWoodAction,
  updateCatalogLabelsAction,
  deleteSizeAction,
  addSizeAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky";
const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-muted";
const iconBtn = "transition-transform active:scale-90 disabled:opacity-30 disabled:pointer-events-none";

export default async function AdminProducts() {
  const [sizes, heights, woods, variants, overrides] = await Promise.all([
    prisma.size.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.height.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.wood.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.variant.findMany({ include: { size: true, height: true } }),
    prisma.productImage.findMany(),
  ]);

  const vAt: Record<string, (typeof variants)[number]> = {};
  for (const v of variants) vAt[`${v.size.key}-${v.height.key}`] = v;

  const overrideMap: Record<string, string> = {};
  for (const o of overrides) overrideMap[`${o.sizeKey}-${o.heightKey}-${o.woodKey}`] = o.url;

  const cells: ImageCell[] = [];
  for (const s of sizes) {
    for (const h of heights) {
      for (const w of woods) {
        const key = `${s.key}-${h.key}-${w.key}`;
        cells.push({
          sizeKey: s.key,
          heightKey: h.key,
          woodKey: w.key,
          sizeLabel: s.label,
          heightLabel: h.label,
          woodLabel: w.label,
          url: overrideMap[key] ?? variantImagePath(s.key, h.key, w.key),
          isOverride: Boolean(overrideMap[key]),
        });
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-1 sm:px-4">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Product management</h1>
        <p className="text-sm text-muted">
          Sizes, heights, prices, stock, finishes, and images. Availability is set
          automatically from stock — units on hand show as <span className="text-emerald-700">In stock</span>, otherwise <span className="text-ink/80">Made to order</span>.
        </p>
      </div>

      {/* Sizes & heights (editable + delete) */}
      <div className="card p-6">
        <form action={updateCatalogLabelsAction}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-lg font-bold text-ink">Sizes &amp; heights</h2>
              <p className="text-sm text-muted">Rename sizes, edit their dimensions, and rename heights.</p>
            </div>
            <SubmitButton savedLabel="Saved">
              <Save className="h-4 w-4" /> Save labels
            </SubmitButton>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Sizes</p>
          <div className="mt-2 space-y-2.5">
            {sizes.map((s) => (
              <div key={s.id} className="grid items-end gap-3 rounded-xl border border-brand-blue/[0.06] bg-panel p-3 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className={labelCls}>Name</label>
                  <input name={`size_label_${s.id}`} defaultValue={s.label} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dimensions</label>
                  <input name={`size_dim_${s.id}`} defaultValue={s.dimensions} className={inputCls} />
                </div>
                <button
                  type="submit"
                  form={`del-size-${s.id}`}
                  disabled={sizes.length <= 1}
                  title={sizes.length <= 1 ? "At least one size is required" : `Delete ${s.label}`}
                  className={`mb-1 inline-flex h-9 w-9 items-center justify-center self-end rounded-lg text-muted hover:text-brand-red-600 ${iconBtn}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Heights</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {heights.map((h) => (
              <div key={h.id}>
                <label className={labelCls}>Height name</label>
                <input name={`height_label_${h.id}`} defaultValue={h.label} className={inputCls} />
              </div>
            ))}
          </div>
        </form>
        {/* Independent delete forms (siblings, not nested) */}
        {sizes.map((s) => (
          <form key={s.id} id={`del-size-${s.id}`} action={deleteSizeAction} className="hidden">
            <input type="hidden" name="id" value={s.id} />
          </form>
        ))}

        {/* Add a size — creates a variant for every height so it's orderable */}
        <form action={addSizeAction} className="mt-5 grid gap-3 rounded-2xl border border-dashed border-brand-blue/12 p-4 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className={labelCls}>New size name</label>
            <input name="label" placeholder="e.g. California King" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Dimensions</label>
            <input name="dimensions" placeholder='e.g. 72" × 84"' className={inputCls} />
          </div>
          <SubmitButton variant="outline" size="sm" savedLabel="Added" className="self-end">
            <Plus className="h-4 w-4" /> Add size
          </SubmitButton>
        </form>
      </div>

      {/* Prices + stock */}
      <form action={updatePricesAction} className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-blue/[0.08] px-6 py-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-ink">Prices &amp; stock</h2>
            <p className="text-sm text-muted">Base price (USD) and units on hand per size × height.</p>
          </div>
          <SubmitButton savedLabel="Saved">
            <Save className="h-4 w-4" /> Save catalogue
          </SubmitButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] table-fixed text-sm">
            <thead>
              <tr className="border-b border-brand-blue/[0.08] bg-brand-blue/[0.02] text-left text-xs uppercase tracking-wide text-muted">
                <th className="w-1/3 px-6 py-3 font-medium">Size</th>
                {heights.map((h) => (
                  <th key={h.id} className="px-6 py-3 text-right font-medium">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.id} className="border-b border-brand-blue/[0.06] last:border-0">
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-ink">{s.label}</span>
                    <span className="ml-2 text-xs text-muted">{s.dimensions}</span>
                  </td>
                  {heights.map((h) => {
                    const v = vAt[`${s.key}-${h.key}`];
                    if (!v) return <td key={h.id} className="px-6 py-3 text-right text-muted">—</td>;
                    return (
                      <td key={h.id} className="px-6 py-3 align-top">
                        <div className="ml-auto w-36 space-y-1.5">
                          <div className="flex items-center justify-between rounded-lg border border-brand-blue/12 bg-panel px-2.5 py-1">
                            <span className="text-xs text-muted">Price</span>
                            <span className="flex items-center gap-0.5">
                              <span className="text-muted">$</span>
                              <input name={`price_${v.id}`} type="number" min={0} defaultValue={v.basePrice}
                                className="w-16 bg-transparent py-0.5 text-right text-ink outline-none" />
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-brand-blue/12 bg-panel px-2.5 py-1">
                            <span className="text-xs text-muted">Stock</span>
                            <input name={`stock_${v.id}`} type="number" min={0} defaultValue={v.stock}
                              className="w-16 bg-transparent py-0.5 text-right text-ink outline-none" />
                          </div>
                          <div className="flex justify-end">
                            {v.stock > 0 ? (
                              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700">In stock</span>
                            ) : (
                              <span className="rounded-full bg-brand-blue/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted">Made to order</span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-6 pb-4 text-xs text-muted">
          Total units in stock: {variants.reduce((a, v) => a + v.stock, 0)}
        </p>
      </form>

      {/* Wood finishes — editable name + delete + add */}
      <div className="card p-6">
        <form action={updateWoodsAction}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-sans text-lg font-bold text-ink">Wood finishes</h2>
              <p className="text-sm text-muted">Rename finishes, set upcharges and availability, or remove one.</p>
            </div>
            <SubmitButton savedLabel="Saved">
              <Save className="h-4 w-4" /> Save finishes
            </SubmitButton>
          </div>
          <ul className="mt-5 divide-y divide-brand-blue/[0.08]">
            {woods.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="h-8 w-8 shrink-0 rounded-full ring-1 ring-brand-blue/15" style={{ backgroundColor: w.swatch }} />
                <input name={`wood_label_${w.id}`} defaultValue={w.label}
                  className="w-40 rounded-lg border border-brand-blue/12 bg-panel px-3 py-1.5 text-sm font-medium text-ink outline-none focus:border-brand-sky" />
                <div className="ml-auto flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-1.5 text-muted">
                    +$
                    <input name={`wood_delta_${w.id}`} type="number" min={0} defaultValue={w.priceDelta}
                      className="w-20 rounded-lg border border-brand-blue/12 bg-panel px-2 py-1.5 text-right text-ink outline-none" />
                  </label>
                  <label className="flex items-center gap-2 text-muted">
                    <input type="checkbox" name={`wood_active_${w.id}`} defaultChecked={w.active} className="h-4 w-4 accent-brand-sky" />
                    Active
                  </label>
                  <button
                    type="submit"
                    form={`del-wood-${w.id}`}
                    disabled={woods.length <= 1}
                    title={woods.length <= 1 ? "At least one finish is required" : `Delete ${w.label}`}
                    className={`text-muted hover:text-brand-red-600 ${iconBtn}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </form>
        {/* Independent delete forms (siblings, not nested) */}
        {woods.map((w) => (
          <form key={w.id} id={`del-wood-${w.id}`} action={deleteWoodAction} className="hidden">
            <input type="hidden" name="id" value={w.id} />
          </form>
        ))}

        <form action={addWoodAction} className="mt-6 grid gap-3 rounded-2xl border border-dashed border-brand-blue/12 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
          <input name="label" placeholder="New finish name (e.g. Cherry)"
            className="rounded-lg border border-brand-blue/12 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-brand-sky" />
          <label className="inline-flex items-center gap-2 rounded-lg border border-brand-blue/12 bg-panel px-2 text-sm text-muted">
            Color <input name="swatch" type="color" defaultValue="#B5651D" className="h-7 w-9 cursor-pointer bg-transparent" />
          </label>
          <label className="inline-flex items-center gap-1 rounded-lg border border-brand-blue/12 bg-panel px-2 text-sm text-muted">
            +$ <input name="priceDelta" type="number" min={0} defaultValue={0} className="w-16 bg-transparent py-2 text-right text-ink outline-none" />
          </label>
          <SubmitButton variant="outline" savedLabel="Added">
            <Plus className="h-4 w-4" /> Add finish
          </SubmitButton>
        </form>
      </div>

      {/* Product images */}
      <div className="card p-6">
        <h2 className="font-sans text-lg font-bold text-ink">Product images</h2>
        <p className="text-sm text-muted">
          Every combination is shown below. Upload a real photo to replace any composed preview.
        </p>
        <div className="mt-6">
          <ImageManager cells={cells} />
        </div>
      </div>
    </div>
  );
}

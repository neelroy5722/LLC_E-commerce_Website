import { SubmitButton } from "@/components/ui/SubmitButton";
import { AddressFields } from "@/components/AddressFields";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { getCurrentUser } from "@/lib/session";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <form action={updateProfile} className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink">Profile &amp; shipping</h2>
        <p className="text-sm text-muted">
          Your contact details and delivery address — used for order updates and freight scheduling.
        </p>

        {/* Contact details */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" name="name" defaultValue={user.name ?? ""} />
          <Field label="Email" name="email" defaultValue={user.email} disabled />
          <Field label="Phone" name="phone" defaultValue={user.phone ?? ""} />
        </div>

        {/* Address */}
        <div className="mt-8 border-t border-brand-blue/[0.08] pt-6">
          <h3 className="text-sm font-semibold text-ink">Shipping address</h3>
          <p className="mt-1 text-sm text-muted">
            Type or pick your city — we&apos;ll fill in the state and ZIP.
          </p>
          <div className="mt-5">
            <AddressFields
              defaults={{
                line1: user.addressLine1 ?? "",
                city: user.city ?? "",
                state: user.state ?? "",
                zip: user.zip ?? "",
              }}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-brand-blue/[0.08] pt-6">
          <SubmitButton size="md" savedLabel="Saved">Save all changes</SubmitButton>
        </div>
      </form>

      <ChangePasswordForm />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-brand-blue/12 bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-sky focus:ring-2 focus:ring-brand-sky/20 disabled:opacity-60"
      />
    </div>
  );
}

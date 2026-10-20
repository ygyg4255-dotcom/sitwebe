"use client";

/**
 * White-label settings form (admin). Edits the single site_settings
 * row: agency identity, the full color palette (hex + visual picker),
 * contact details and social links. Colors are REQUIRED hex values —
 * they drive the CSS variables of every public page.
 */
import { useActionState, useState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { ImageUploadField } from "@/components/admin/Controls";
import { Field, FormSection } from "./Field";

/** Hex text input with a synced native color picker. */
function ColorField({
  label,
  name,
  value,
  error,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
}) {
  const [hex, setHex] = useState(value);
  // Native color input requires the 6-digit form; 3-digit hex (#fff)
  // is valid for the schema but not for the picker.
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000";

  return (
    <div>
      <label htmlFor={`settings-${name}`} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} — sélecteur`}
          value={pickerValue}
          onChange={(event) => setHex(event.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-xl border border-brand-border bg-surface p-1"
        />
        <input
          id={`settings-${name}`}
          name={name}
          value={hex}
          onChange={(event) => setHex(event.target.value)}
          required
          maxLength={7}
          className="w-full rounded-xl border border-brand-border bg-surface px-3 py-2 font-mono text-sm text-ink focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary/40"
        />
      </div>
      {error ? <p role="alert" className="mt-1 text-sm font-medium text-primary">{error}</p> : null}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: TableRow<"site_settings"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateSiteSettings,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        <FormSection title="Identité de l'agence">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom de l'agence *" htmlFor="settings-agencyName" error={errors?.agencyName}>
              <Input id="settings-agencyName" name="agencyName" required defaultValue={settings.agency_name} maxLength={100} />
            </Field>
            <Field label="Slogan" htmlFor="settings-tagline" error={errors?.tagline}
              hint="Phrase courte affichée sous le nom">
              <Input id="settings-tagline" name="tagline" defaultValue={settings.tagline ?? ""} maxLength={160} />
            </Field>
          </div>

          <ImageUploadField
            name="logoUrl"
            folder="branding"
            currentUrl={settings.logo_url}
            label="Logo (facultatif)"
          />
          {errors?.logoUrl ? (
            <p role="alert" className="text-sm font-medium text-primary">{errors.logoUrl}</p>
          ) : null}
        </FormSection>

        <FormSection title="Couleurs de la marque">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ColorField label="Primaire *" name="primaryColor" value={settings.primary_color} error={errors?.primaryColor} />
            <ColorField label="Primaire foncé *" name="primaryDarkColor" value={settings.primary_dark_color} error={errors?.primaryDarkColor} />
            <ColorField label="Accent *" name="accentColor" value={settings.accent_color} error={errors?.accentColor} />
            <ColorField label="Secondaire *" name="secondaryColor" value={settings.secondary_color} error={errors?.secondaryColor} />
            <ColorField label="Texte (encre) *" name="inkColor" value={settings.ink_color} error={errors?.inkColor} />
            <ColorField label="Fond (papier) *" name="paperColor" value={settings.paper_color} error={errors?.paperColor} />
            <ColorField label="Sable *" name="sandColor" value={settings.sand_color} error={errors?.sandColor} />
            <ColorField label="Surface *" name="surfaceColor" value={settings.surface_color} error={errors?.surfaceColor} />
            <ColorField label="Texte discret *" name="mutedColor" value={settings.muted_color} error={errors?.mutedColor} />
            <ColorField label="Bordures *" name="borderColor" value={settings.border_color} error={errors?.borderColor} />
          </div>
        </FormSection>

        <FormSection title="Coordonnées">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="settings-phone" error={errors?.phone}>
              <Input id="settings-phone" name="phone" defaultValue={settings.phone ?? ""} maxLength={30} />
            </Field>
            <Field label="WhatsApp" htmlFor="settings-whatsapp" error={errors?.whatsapp}
              hint="Chiffres uniquement, format international : 212612345678">
              <Input id="settings-whatsapp" name="whatsapp" defaultValue={settings.whatsapp ?? ""} maxLength={15} />
            </Field>
            <Field label="E-mail" htmlFor="settings-email" error={errors?.email}>
              <Input id="settings-email" name="email" type="email" defaultValue={settings.email ?? ""} maxLength={200} />
            </Field>
            <Field label="Ville" htmlFor="settings-city" error={errors?.city}>
              <Input id="settings-city" name="city" defaultValue={settings.city ?? ""} maxLength={100} />
            </Field>
          </div>
          <Field label="Adresse" htmlFor="settings-address" error={errors?.address}>
            <Input id="settings-address" name="address" defaultValue={settings.address ?? ""} maxLength={200} />
          </Field>
        </FormSection>

        <FormSection title="Réseaux sociaux">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Facebook" htmlFor="settings-facebookUrl" error={errors?.facebookUrl}>
              <Input id="settings-facebookUrl" name="facebookUrl" type="url" defaultValue={settings.facebook_url ?? ""} maxLength={300} />
            </Field>
            <Field label="Instagram" htmlFor="settings-instagramUrl" error={errors?.instagramUrl}>
              <Input id="settings-instagramUrl" name="instagramUrl" type="url" defaultValue={settings.instagram_url ?? ""} maxLength={300} />
            </Field>
            <Field label="Tripadvisor" htmlFor="settings-tripadvisorUrl" error={errors?.tripadvisorUrl}>
              <Input id="settings-tripadvisorUrl" name="tripadvisorUrl" type="url" defaultValue={settings.tripadvisor_url ?? ""} maxLength={300} />
            </Field>
          </div>
        </FormSection>

        {state && !state.success ? (
          <div role="alert" className="mt-6 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {state.error}
          </div>
        ) : null}
        {ok ? (
          <div role="status" className="mt-6 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            Enregistré ✓
          </div>
        ) : null}

        <div className="mt-6">
          <SubmitButton pendingLabel="Enregistrement…">Enregistrer les paramètres</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
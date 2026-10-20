"use client";

/**
 * Staff login form (email + password → Supabase Auth). The login action
 * sets the encrypted session cookies and redirects into /admin; this
 * client component adds pending / error states only.
 */
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError, FormAlert, SubmitButton } from "@/components/forms/FormBits";

export function LoginForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    login,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={100}
        />
        <FieldError message={errors?.email} />
      </div>
      <div>
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          maxLength={72}
        />
        <FieldError message={errors?.password} />
      </div>

      <FormAlert message={state && !state.success ? state.error : undefined} />

      <SubmitButton pendingLabel="Connexion…" className="w-full">
        Se connecter
      </SubmitButton>
    </form>
  );
}
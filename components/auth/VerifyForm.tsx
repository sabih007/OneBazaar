"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { verifyOtpSchema, type VerifyOtpInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") || "/";
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({ resolver: zodResolver(verifyOtpSchema) });

  async function onSubmit(values: VerifyOtpInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: values.code,
      type: "signup",
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleResend() {
    setFormError(null);
    setResent(false);
    setResending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    setResent(true);
  }

  if (!email) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink">Verify your email</h1>
        <p className="mt-2 text-sm text-ink-muted">
          We couldn&apos;t find an email to verify.{" "}
          <Link href="/signup" className="font-medium text-primary hover:text-primary-hover">
            Sign up
          </Link>{" "}
          again to get a new code.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Verify your email</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Enter the 6-digit code we sent to <span className="font-medium text-ink">{email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            error={errors.code?.message}
            {...register("code")}
          />
          {errors.code && <p className="mt-1 text-xs text-danger">{errors.code.message}</p>}
        </div>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        {resent && !formError && <p className="text-sm text-primary">A new code was sent.</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Verify"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-primary hover:text-primary-hover disabled:opacity-50 disabled:pointer-events-none"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  partnerApplicationSchema,
  type PartnerApplicationInput,
} from "@/lib/validations/partner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerApplicationInput>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: { tier: "partner" },
  });

  async function onSubmit(values: PartnerApplicationInput) {
    setError(null);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Submission failed. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 className="h-12 w-12 text-success" aria-hidden />
        <h3 className="mt-3 font-heading text-xl font-semibold text-ink">Application received</h3>
        <p className="mt-1 max-w-sm text-sm text-ink-muted">
          Thanks for your interest in partnering with Buysellox. Our team will review your
          application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Full name" {...register("name")} error={errors.name?.message} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="business">Business name (optional)</Label>
          <Input id="business" placeholder="Company or shop" {...register("business")} />
          {errors.business && <p className="mt-1 text-xs text-danger">{errors.business.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="03xx-xxxxxxx"
            {...register("phone")}
            error={errors.phone?.message}
          />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="tier">Partnership tier</Label>
        <Select id="tier" {...register("tier")}>
          <option value="partner">Our Partner</option>
          <option value="premium">Our Premium Partner</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">Tell us about your business (optional)</Label>
        <Textarea
          id="message"
          placeholder="What do you sell, and what are you hoping to get out of a partnership?"
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-danger">{errors.message.message}</p>}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const reasons = [
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "other", label: "Other" },
];

export default function ReportButton({
  listingId,
  userId,
}: {
  listingId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function openModal() {
    if (!userId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setOpen(true);
  }

  async function submit() {
    if (!userId) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        listing_id: listingId,
        reporter_id: userId,
        reason,
        details: details || null,
      });
      if (!error) setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={openModal} className="gap-2 text-ink-muted">
        <Flag className="h-4 w-4" aria-hidden />
        Report
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-sm rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card-hover)]">
            {done ? (
              <>
                <h3 className="font-heading text-lg font-semibold text-ink">Report submitted</h3>
                <p className="mt-1 text-sm text-ink-muted">Thanks — our team will review this listing.</p>
                <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-semibold text-ink">Report this listing</h3>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Reason</label>
                  <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                    {reasons.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mt-3">
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit report"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

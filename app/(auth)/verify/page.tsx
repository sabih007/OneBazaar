import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyForm from "@/components/auth/VerifyForm";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

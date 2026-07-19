import { z } from "zod";

export const partnerApplicationSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  business: z.string().max(120, "Keep it under 120 characters").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^\+?\d[\d\s-]*$/, "Enter a valid phone number"),
  tier: z.enum(["partner", "premium"]),
  message: z.string().max(1000, "Keep it under 1000 characters").optional().or(z.literal("")),
});

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;

import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^\+?\d[\d\s-]*$/, "Enter a valid phone number"),
  city: z.string().min(1, "Select your city"),
});

export type ProfileInput = z.infer<typeof profileSchema>;

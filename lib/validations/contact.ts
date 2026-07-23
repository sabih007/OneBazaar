import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Tell us a bit more (at least 10 characters)").max(2000, "Keep it under 2000 characters"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

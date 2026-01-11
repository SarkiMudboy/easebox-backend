import { z } from "zod";

export const requestVerificationSchema = z.object({
  type: z.enum(["email", "phone"], {
    error: "Type must be 'email' or 'phone'",
  }),
  userId: z.uuid("Invalid user ID"),
});

export const verifyOtpSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
  type: z.enum(["email", "phone"], {
    error: "Type must be 'email' or 'phone'",
  }),
  userId: z.uuid("Invalid user ID"),
});

export type RequestVerificationDto = z.infer<typeof requestVerificationSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;


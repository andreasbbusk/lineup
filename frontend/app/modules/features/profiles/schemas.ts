import { z } from "zod";

// Basic Info Schema
export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  phoneCountryCode: z
    .number()
    .min(1, "Country code is required")
    .max(999, "Invalid country code"),
  phoneNumber: z
    .number()
    .min(1000, "Phone number must be at least 4 digits")
    .max(999999999999999, "Phone number must be at most 15 digits"),
  yearOfBirth: z
    .number()
    .min(1905, "Invalid year")
    .max(new Date().getFullYear() - 13, "You must be at least 13 years old"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location is too long"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

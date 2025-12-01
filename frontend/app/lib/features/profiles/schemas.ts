import { z } from "zod";

// Basic Info Schema
export const basicInfoSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  country_code: z
    .string()
    .min(1, "Country code is required")
    .regex(/^\+\d{2,4}$/, "Invalid country code format"),
  phone_number: z
    .string()
    .min(4, "Phone number is required")
    .refine((value) => value.match(/^\d+$/), "Phone number must contain only digits")
    .min(4, "Phone number must be at least 4 digits")
    .max(15, "Phone number must be at most 15 digits"),
  year_of_birth: z
    .string()
    .min(1, "Year of birth is required")
    .regex(/^\d{4}$/, "Year of birth must be a 4-digit year")
    .refine(
      (year) => {
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(year, 10);
        const age = currentYear - birthYear;
        return age >= 13 && age <= 120;
      },
      { message: "You must be at least 13 years old" }
    ),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location is too long"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

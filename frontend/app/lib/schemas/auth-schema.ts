import { z } from "zod";

const PASSWORD_RULES = {
  minLength: 6,
  requireNumberOrSymbol: true,
  requireUppercase: true,
  requireLowercase: true,
};

export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(PASSWORD_RULES.minLength, "Password must be at least 6 characters")
      .regex(/[\d\W]/, "Password must contain a number or symbol")
      .regex(/[a-z]/, "Password must contain lowercase letters")
      .regex(/[A-Z]/, "Password must contain uppercase letters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  countryCode: z
    .string()
    .min(1, "Country code is required")
    .regex(/^\+\d{2,4}$/, "Invalid country code format"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .min(8, "Phone number must be at least 8 digits"),
  yearOfBirth: z
    .string()
    .min(1, "Year of birth is required")
    .regex(/^\d{4}$/, "Year of birth must be a 4-digit year")
    .refine(
      (year) => {
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(year);
        const age = currentYear - birthYear;
        return age >= 13 && age <= 120;
      },
      { message: "You must be at least 13 years old" }
    ),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name is too long"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

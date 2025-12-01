import { z } from "zod";

const PASSWORD_RULES = {
  minLength: 6,
  requireNumberOrSymbol: true,
  requireUppercase: true,
  requireLowercase: true,
};

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
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
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

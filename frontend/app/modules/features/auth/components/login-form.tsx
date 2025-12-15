"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormData } from "../schemas";
import { ErrorMessage } from "@/app/modules/components/error-message";
import { Button } from "@/app/modules/components/buttons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 sm:gap-8">
      <h1 className="text-xl font-bold leading-6 tracking-[0.18px] text-grey sm:text-2xl">
        Login
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-65 flex-col gap-3 sm:gap-4"
      >
        {/* Global Error Message */}
        {error && <ErrorMessage message={error.message} />}

        {/* Email Field */}
        <div>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
              errors.email ? "border-maroon bg-maroon/5" : "border-black/10"
            }`}
            placeholder="Enter your email"
            disabled={isPending}
            autoComplete="email"
          />
          {errors.email && (
            <ErrorMessage message={errors.email.message || ""} />
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm placeholder:text-input-placeholder sm:text-base ${
                errors.password
                  ? "border-maroon bg-maroon/5"
                  : "border-black/10"
              }`}
              placeholder="Enter your password"
              disabled={isPending}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey transition-colors hover:text-black"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <ErrorMessage message={errors.password.message || ""} />
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid || isPending}
          className="mx-auto w-full max-w-28 rounded-full bg-yellow px-6 py-2 text-sm font-medium text-black transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          onClick={() => {}}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm text-text-secondary sm:text-base">
          or
        </p>

        {/* OAuth Buttons */}
        <button
          type="button"
          disabled
          className="mx-auto w-full max-w-48 rounded-full border border-black/20 bg-white py-2 text-sm font-medium text-black transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
        >
          Login with Google
        </button>

        <button
          type="button"
          disabled
          className="mx-auto w-full max-w-48 rounded-full border border-black/20 bg-white py-2 text-sm font-medium text-black transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
        >
          Login with AppleID
        </button>
      </form>

      <p className="w-full px-2 text-center text-sm text-text-secondary sm:text-base">
        Don&apos;t have an account?{" "}
        <Link href="/onboarding" className="text-link-blue hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

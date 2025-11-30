"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import {
  signupSchema,
  type SignupFormData,
} from "@/app/lib/schemas/auth-schema";
import { Button } from "@/app/components/ui/buttons";
import { ErrorMessage } from "@/app/components/ui/error-message";
import {
  checkUsernameAvailability,
  signupWithAuth,
} from "@/app/lib/api/endpoints/auth";

const USERNAME_CHECK_DEBOUNCE = 500; // ms

export function OnboardingSignupStep() {
  const { onboarding, update_onboarding_data, mark_account_created } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

  const [signupError, setSignupError] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      username: onboarding.data.username || "",
      email: onboarding.data.email || "",
      password: "",
      confirm_password: "",
    },
  });

  const watchedUsername = watch("username");

  // Debounced username availability check
  useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameValidation({ checking: false, available: null, message: "" });
      return;
    }

    setUsernameValidation({
      checking: true,
      available: null,
      message: "Checking availability...",
    });

    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(watchedUsername);
        setUsernameValidation({
          checking: false,
          available: result.available,
          message: result.available
            ? "Username is available"
            : "Username is already taken",
        });
      } catch {
        setUsernameValidation({
          checking: false,
          available: null,
          message: "Error checking username",
        });
      }
    }, USERNAME_CHECK_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = async (formData: SignupFormData) => {
    setSignupError("");
    setIsCreatingAccount(true);

    try {
      const result = await signupWithAuth({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (result.session) {
        const { set_auth } = useAppStore.getState();
        set_auth(result.user, result.session.access_token, null);
      }

      update_onboarding_data({
        username: formData.username,
        email: formData.email,
      });

      mark_account_created();
      nextStep();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (errorMessage.includes("already registered")) {
        setSignupError(
          "This email is already registered. Please log in instead."
        );
      } else {
        setSignupError(errorMessage);
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const canSubmit =
    !usernameValidation.checking &&
    usernameValidation.available !== false &&
    !isCreatingAccount;

  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 sm:gap-8">
      <h1 className="text-xl font-bold leading-6 tracking-[0.18px] text-grey sm:text-2xl">
        Sign up
      </h1>

      <p className="px-2 text-center text-sm leading-normal tracking-[0.5px] text-black sm:text-base">
        By continuing you agree to LineUp! Terms of use and Privacy Policy
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full max-w-65 flex-col gap-3 sm:gap-4"
      >
        {/* Username Field */}
        <div>
          <input
            type="text"
            {...register("username")}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
              errors.username || usernameValidation.available === false
                ? "border-maroon bg-maroon/5"
                : usernameValidation.available === true
                ? "border-green-500 bg-green-50"
                : "border-black/10"
            }`}
            placeholder="Choose a username"
            disabled={isCreatingAccount}
          />
          {errors.username && (
            <ErrorMessage message={errors.username.message || ""} />
          )}
          {!errors.username && usernameValidation.message && (
            <p
              className={`mt-1 text-sm ${
                usernameValidation.checking
                  ? "text-gray-500"
                  : usernameValidation.available
                  ? "text-green-600"
                  : "text-maroon"
              }`}
            >
              {usernameValidation.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <input
            type="email"
            {...register("email")}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
              errors.email ? "border-maroon bg-maroon/5" : "border-black/10"
            }`}
            placeholder="Enter your email"
            disabled={isCreatingAccount}
          />
          {errors.email && (
            <ErrorMessage message={errors.email.message || ""} />
          )}
        </div>

        {/* Password Field */}
        <div>
          <input
            type="password"
            {...register("password")}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
              errors.password ? "border-maroon bg-maroon/5" : "border-black/10"
            }`}
            placeholder="Enter your password"
            disabled={isCreatingAccount}
          />
          {errors.password && (
            <ErrorMessage message={errors.password.message || ""} />
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <input
            type="password"
            {...register("confirm_password")}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
              errors.confirm_password
                ? "border-maroon bg-maroon/5"
                : "border-black/10"
            }`}
            placeholder="Repeat your password"
            disabled={isCreatingAccount}
          />
          {errors.confirm_password && (
            <ErrorMessage message={errors.confirm_password.message || ""} />
          )}
        </div>

        {/* Signup Error */}
        {signupError && <ErrorMessage message={signupError} />}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="max-w-28 w-full mx-auto"
          disabled={!canSubmit}
          onClick={() => {}}
        >
          {isCreatingAccount ? "Creating account..." : "Continue"}
        </Button>

        <p className="text-center text-sm text-text-secondary sm:text-base">
          or
        </p>

        {/* OAuth Buttons */}
        <Button type="button" variant="secondary" disabled onClick={() => {}} className="py-2 max-w-48 w-full mx-auto">
          Sign up with Google
        </Button>

        <Button type="button" variant="secondary" disabled onClick={() => {}} className="py-2 max-w-48 w-full mx-auto">
          Sign up with AppleID
        </Button>
      </form>

      <p className="w-full px-2 text-center text-sm text-text-secondary sm:text-base">
        Already have an account?{" "}
        <Link href="/login" className="text-link-blue hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}

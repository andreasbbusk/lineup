"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/app/modules/stores/Store";
import {
  signupSchema,
  type SignupFormData,
  checkUsernameAvailability,
  signupWithAuth,
} from "@/app/modules/features/auth";
import { Button } from "@/app/modules/components/buttons";
import { ErrorMessage } from "@/app/modules/components/error-message";

const USERNAME_CHECK_DEBOUNCE = 500;

export function OnboardingSignupStep() {
  const router = useRouter();
  const {
    onboarding,
    updateOnboardingData,
    markAccountCreated,
    initializeAuth,
  } = useAppStore();

  const [signupError, setSignupError] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [usernameState, setUsernameState] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      username: onboarding?.data.username || "",
      email: onboarding?.data.email || "",
      password: "",
      confirm_password: "",
    },
  });

  const watchedUsername = watch("username");

  // Username availability check
  useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameState({ checking: false, available: null });
      return;
    }

    setUsernameState({ checking: true, available: null });

    const timeoutId = setTimeout(async () => {
      try {
        const { available } = await checkUsernameAvailability(watchedUsername);
        setUsernameState({ checking: false, available });
      } catch {
        setUsernameState({ checking: false, available: null });
      }
    }, USERNAME_CHECK_DEBOUNCE);

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = async (formData: SignupFormData) => {
    setSignupError("");
    setIsCreatingAccount(true);

    try {
      await signupWithAuth({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      await initializeAuth();

      updateOnboardingData({
        username: formData.username,
        email: formData.email,
      });

      markAccountCreated();
      router.push("/onboarding?step=3");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSignupError(
        message.includes("already registered")
          ? "This email is already registered. Please log in instead."
          : message
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const canSubmit =
    !usernameState.checking &&
    usernameState.available !== false &&
    !isCreatingAccount;

  // Helper to get username validation message
  const getUsernameMessage = () => {
    if (!watchedUsername || watchedUsername.length < 3) return null;
    if (usernameState.checking)
      return { text: "Checking availability...", color: "text-gray-500" };
    if (usernameState.available === true)
      return { text: "Username is available", color: "text-green-600" };
    if (usernameState.available === false)
      return { text: "Username is already taken", color: "text-maroon" };
    return null;
  };

  const usernameMessage = getUsernameMessage();

  // Helper to get input styling
  const getInputClass = (hasError: boolean, isSuccess?: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-input-placeholder sm:text-base ${
      hasError
        ? "border-maroon bg-maroon/5"
        : isSuccess
        ? "border-green-500 bg-green-50"
        : "border-black/10"
    }`;

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
            className={getInputClass(
              !!errors.username || usernameState.available === false,
              usernameState.available === true
            )}
            placeholder="Choose a username"
            disabled={isCreatingAccount}
          />
          {errors.username && (
            <ErrorMessage message={errors.username.message!} />
          )}
          {!errors.username && usernameMessage && (
            <p className={`mt-1 text-sm ${usernameMessage.color}`}>
              {usernameMessage.text}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <input
            type="email"
            {...register("email")}
            className={getInputClass(!!errors.email)}
            placeholder="Enter your email"
            disabled={isCreatingAccount}
          />
          {errors.email && <ErrorMessage message={errors.email.message!} />}
        </div>

        {/* Password Field */}
        <div>
          <input
            type="password"
            {...register("password")}
            className={getInputClass(!!errors.password)}
            placeholder="Enter your password"
            disabled={isCreatingAccount}
          />
          {errors.password && (
            <ErrorMessage message={errors.password.message!} />
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <input
            type="password"
            {...register("confirm_password")}
            className={getInputClass(!!errors.confirm_password)}
            placeholder="Repeat your password"
            disabled={isCreatingAccount}
          />
          {errors.confirm_password && (
            <ErrorMessage message={errors.confirm_password.message!} />
          )}
        </div>

        {signupError && <ErrorMessage message={signupError} />}

        <Button
          type="submit"
          variant="primary"
          className="max-w-28 w-full mx-auto"
          disabled={!canSubmit}
          onClick={() => {}}
        >
          {isCreatingAccount ? "Creating..." : "Continue"}
        </Button>

        <p className="text-center text-sm text-text-secondary sm:text-base">
          or
        </p>

        <Button
          onClick={() => {}}
          type="button"
          variant="secondary"
          disabled
          className="py-2 max-w-48 w-full mx-auto"
        >
          Sign up with Google
        </Button>

        <Button
          onClick={() => {}}
          type="button"
          variant="secondary"
          disabled
          className="py-2 max-w-48 w-full mx-auto"
        >
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

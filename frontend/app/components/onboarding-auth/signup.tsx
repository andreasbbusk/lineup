"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAppStore } from "@/app/lib/stores/app-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { useSignupBasicMutation } from "@/app/lib/query/mutations/auth.mutations";
import {
  signupSchema,
  type SignupFormData,
} from "@/app/lib/schemas/auth-schema";
import { Button } from "@/app/components/ui/buttons";
import { ErrorMessage } from "@/app/components/ui/error-message";
import { checkUsernameAvailability } from "@/app/lib/utils/supabase-validation";

export function OnboardingSignupStep() {
  const { onboarding, updateOnboardingData, markAccountCreated } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

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
      confirmPassword: "",
    },
  });

  const {
    mutate: createAccount,
    isPending,
    error: apiError,
  } = useSignupBasicMutation();

  // Watch username field for changes
  const watchedUsername = watch("username");

  // Debounced username validation
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
      const result = await checkUsernameAvailability(watchedUsername);
      setUsernameValidation({
        checking: false,
        available: result.available,
        message:
          result.error || (result.available ? "Username is available" : ""),
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [watchedUsername]);

  const onSubmit = (formData: SignupFormData) => {
    createAccount(
      {
        email: formData.email,
        password: formData.password,
        username: formData.username,
      },
      {
        onSuccess: () => {
          updateOnboardingData({
            username: formData.username,
            email: formData.email,
            password: undefined,
          }); // Clear password after creation
          markAccountCreated();
          nextStep();
        },
      }
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 sm:gap-8 max-w-lg">
      <h1 className="text-xl font-bold leading-6 tracking-[0.18px] text-grey sm:text-2xl">
        Sign up
      </h1>

      <div className="flex w-full flex-col items-center gap-5 sm:gap-6">
        <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
          <p className="px-2 text-center text-sm leading-normal tracking-[0.5px] text-black sm:text-base">
            By continuing you agree to LineUp! Terms of use and Privacy Policy
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center gap-3 sm:gap-4"
          >
            {apiError && <ErrorMessage message={apiError.message} />}

            <div className="w-full">
              <input
                type="text"
                {...register("username")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-input-placeholder sm:px-2.5 sm:py-2.5 sm:text-base ${
                  errors.username || usernameValidation.available === false
                    ? "border-maroon bg-maroon/5"
                    : usernameValidation.available === true
                    ? "border-green-500 bg-green-50"
                    : "border-black/10"
                }`}
                placeholder="Choose a username"
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

            <div className="w-full">
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-input-placeholder sm:px-2.5 sm:py-2.5 sm:text-base ${
                  errors.email ? "border-maroon bg-maroon/5" : "border-black/10"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <ErrorMessage message={errors.email.message || ""} />
              )}
            </div>

            <div className="w-full">
              <input
                type="password"
                {...register("password")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-input-placeholder sm:px-2.5 sm:py-2.5 sm:text-base ${
                  errors.password
                    ? "border-maroon bg-maroon/5"
                    : "border-black/10"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <ErrorMessage message={errors.password.message || ""} />
              )}
            </div>

            <div className="w-full">
              <input
                type="password"
                {...register("confirmPassword")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-input-placeholder sm:px-2.5 sm:py-2.5 sm:text-base ${
                  errors.confirmPassword
                    ? "border-maroon bg-maroon/5"
                    : "border-black/10"
                }`}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && (
                <ErrorMessage message={errors.confirmPassword.message || ""} />
              )}
            </div>

            <div className="flex w-full flex-col items-center gap-2 sm:gap-2.5">
              <Button
                type="submit"
                variant="primary"
                onClick={() => {}}
                disabled={
                  isPending ||
                  usernameValidation.available === false ||
                  usernameValidation.checking
                }
              >
                {isPending ? "Creating account..." : "Continue"}
              </Button>

              <p className="text-center text-sm leading-normal tracking-[0.5px] text-text-secondary sm:text-base">
                or
              </p>
            </div>

            <div className="flex justify-center  flex-col items-center gap-3 sm:gap-4">
              <Button type="button" variant="secondary" onClick={() => {}}>
                Sign up with Google
              </Button>

              <Button type="button" variant="secondary" onClick={() => {}}>
                Sign up with AppleID
              </Button>
            </div>
          </form>
        </div>
      </div>

      <p className="w-full px-2 text-center text-sm leading-normal tracking-[0.5px] text-text-secondary sm:text-base">
        Already have an account?{" "}
        <Link href="/login" className="text-link-blue">
          Log In
        </Link>
      </p>
    </div>
  );
}

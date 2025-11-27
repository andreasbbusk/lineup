"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { useSignupBasicMutation } from "@/app/lib/query/mutations/auth.mutations";
import {
  signupSchema,
  type SignupFormData,
} from "@/app/lib/schemas/auth-schema";
import { Button } from "@/app/components/ui/buttons";

export function OnboardingSignupStep() {
  const { data, updateData, markAccountCreated } = useOnboardingStore();
  const { nextStep } = useOnboardingNavigation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      email: data.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    mutate: createAccount,
    isPending,
    error: apiError,
  } = useSignupBasicMutation();

  const onSubmit = (formData: SignupFormData) => {
    createAccount(
      { email: formData.email, password: formData.password },
      {
        onSuccess: () => {
          updateData({ email: formData.email, password: undefined }); // Clear password after creation
          markAccountCreated();
          nextStep();
        },
      }
    );
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 sm:gap-[30px] max-w-lg">
      <h1 className="text-xl font-bold leading-6 tracking-[0.18px] text-grey sm:text-2xl">
        Sign up
      </h1>

      <div className="flex w-full flex-col items-center gap-5 sm:gap-[22px]">
        <div className="flex w-full flex-col items-center gap-3 sm:gap-[15px]">
          <p className="px-2 text-center text-sm leading-normal tracking-[0.5px] text-black sm:text-base">
            By continuing you agree to LineUp! Terms of use and Privacy Policy
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center gap-3 sm:gap-[15px]"
          >
            {apiError && (
              <div className="w-full rounded-lg border border-maroon bg-maroon/10 px-3 py-2 text-xs text-maroon sm:px-4 sm:py-3 sm:text-sm">
                {apiError.message}
              </div>
            )}

            <div className="w-full">
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-[#555555] sm:px-[10px] sm:py-[10px] sm:text-base ${
                  errors.email
                    ? "border-maroon bg-maroon/5"
                    : "border-[rgba(0,0,0,0.1)]"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-maroon">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <input
                type="password"
                {...register("password")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-[#555555] sm:px-[10px] sm:py-[10px] sm:text-base ${
                  errors.password
                    ? "border-maroon bg-maroon/5"
                    : "border-[rgba(0,0,0,0.1)]"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-maroon">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <input
                type="password"
                {...register("confirmPassword")}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm leading-normal tracking-[0.5px] placeholder:text-[#555555] sm:px-[10px] sm:py-[10px] sm:text-base ${
                  errors.confirmPassword
                    ? "border-maroon bg-maroon/5"
                    : "border-[rgba(0,0,0,0.1)]"
                }`}
                placeholder="Repeat your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-maroon">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col items-center gap-2 sm:gap-[10px]">
              <Button type="submit" variant="primary" onClick={() => {}}>
                {isPending ? "Creating account..." : "Continue"}
              </Button>

              <p className="text-center text-sm leading-normal tracking-[0.5px] text-[#1e1e1e] sm:text-base">
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

      <p className="w-full px-2 text-center text-sm leading-normal tracking-[0.5px] text-[#1e1e1e] sm:text-base">
        Already have an account?{" "}
        <Link href="/login" className="text-[#007aff]">
          Log In
        </Link>
      </p>
    </div>
  );
}

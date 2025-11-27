"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  basicInfoSchema,
  type BasicInfoFormData,
} from "@/app/lib/schemas/auth-schema";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { Button } from "@/app/components/ui/buttons";

export function OnboardingBasicInfoForm() {
  const { data, updateData } = useOnboardingStore();
  const { nextStep } = useOnboardingNavigation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phoneNumber: data.phoneNumber || "",
      yearOfBirth: data.yearOfBirth?.toString() || "",
      city: data.location || "",
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    updateData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      yearOfBirth: Number(formData.yearOfBirth),
      location: formData.city,
    });
    nextStep();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[260px]">
        <div className="flex flex-col gap-8">
          {/* First & Last Name */}
          <div className="flex flex-col gap-4">
            <label className="text-[18px] font-semibold leading-[19px] tracking-[0.5px] text-black">
              First & last name
            </label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Enter your name & last name"
              className={`w-full rounded-lg border px-[10px] py-[10px] text-[16px] leading-normal tracking-[0.5px] placeholder:text-[#555555] ${
                errors.firstName
                  ? "border-maroon bg-maroon/5"
                  : "border-[rgba(0,0,0,0.1)]"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-maroon">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-4">
            <label className="text-[18px] font-semibold leading-[19px] tracking-[0.5px] text-black">
              Phone number
            </label>
            <div className="flex gap-4">
              <div className="flex h-[44px] w-[44px] items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)]">
                <span className="text-[16px]">🇩🇰</span>
              </div>
              <input
                {...register("phoneNumber")}
                type="tel"
                placeholder="Phone number"
                className={`flex-1 rounded-lg border px-[10px] py-[10px] text-[16px] leading-normal tracking-[0.5px] placeholder:text-[#555555] ${
                  errors.phoneNumber
                    ? "border-maroon bg-maroon/5"
                    : "border-[rgba(0,0,0,0.1)]"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-maroon">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Year of Birth */}
          <div className="flex flex-col gap-4">
            <label className="text-[18px] font-semibold leading-[19px] tracking-[0.5px] text-black">
              Year of birth
            </label>
            <input
              {...register("yearOfBirth")}
              type="text"
              inputMode="numeric"
              placeholder="Enter your year of birth"
              maxLength={4}
              className={`w-full rounded-lg border px-[10px] py-[10px] text-[16px] leading-normal tracking-[0.5px] placeholder:text-[#555555] ${
                errors.yearOfBirth
                  ? "border-maroon bg-maroon/5"
                  : "border-[rgba(0,0,0,0.1)]"
              }`}
            />
            {errors.yearOfBirth && (
              <p className="mt-1 text-xs text-maroon">
                {errors.yearOfBirth.message}
              </p>
            )}
          </div>

          {/* Where do you live? */}
          <div className="flex flex-col gap-4">
            <label className="text-[18px] font-semibold leading-[19px] tracking-[0.5px] text-black">
              Where do you live?
            </label>
            <input
              {...register("city")}
              type="text"
              placeholder="Enter your city"
              className={`w-full rounded-lg border px-[10px] py-[10px] text-[16px] leading-normal tracking-[0.5px] placeholder:text-[#555555] ${
                errors.city
                  ? "border-maroon bg-maroon/5"
                  : "border-[rgba(0,0,0,0.1)]"
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-maroon">{errors.city.message}</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex w-full justify-center">
          <Button
            type="submit"
            variant="primary"
            onClick={() => {}}
            className="font-normal px-5 py-1!"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

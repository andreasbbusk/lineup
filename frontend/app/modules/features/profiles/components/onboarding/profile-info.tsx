"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicInfoSchema, type BasicInfoFormData } from "../../schemas";
import { useOnboardingNavigation } from "../../hooks/onboarding/useOnboardingNavigation";
import { useAppStore } from "@/app/modules/stores/app-store";
import { Button } from "@/app/modules/components/buttons";
import { CustomSelect } from "@/app/modules/components/select";
import { Combobox } from "@/app/modules/components/combobox";
import { NORDIC_CITIES } from "@/app/modules/features/profiles/constants";
import { ErrorMessage } from "@/app/modules/components/error-message";

const COUNTRY_CODES = [
  { value: "45", label: "🇩🇰 +45" },
  { value: "46", label: "🇸🇪 +46" },
  { value: "47", label: "🇳🇴 +47" },
  { value: "358", label: "🇫🇮 +358" },
  { value: "354", label: "🇮🇸 +354" },
];

const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const year = new Date().getFullYear() - 13 - i;
  return { value: year.toString(), label: year.toString() };
});

export function OnboardingProfileInfoStep() {
  const { onboarding, updateOnboardingData } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

  const [fullName, setFullName] = useState(
    [onboarding?.data.firstName, onboarding?.data.lastName]
      .filter(Boolean)
      .join(" ")
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: onboarding?.data.firstName || "",
      lastName: onboarding?.data.lastName || "",
      phoneCountryCode: onboarding?.data.phoneCountryCode || 45,
      phoneNumber: onboarding?.data.phoneNumber || undefined,
      yearOfBirth: onboarding?.data.yearOfBirth || undefined,
      location: onboarding?.data.location || "",
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    updateOnboardingData(formData);
    nextStep();
  };

  const handleNameChange = (value: string) => {
    setFullName(value);
    const nameParts = value.trim().split(/\s+/);

    if (nameParts.length >= 2) {
      setValue("firstName", nameParts[0], { shouldValidate: true });
      setValue("lastName", nameParts.slice(1).join(" "), {
        shouldValidate: true,
      });
    } else {
      setValue("firstName", value.trim(), { shouldValidate: true });
      setValue("lastName", "", { shouldValidate: true });
    }
  };

  const getInputClass = (hasError: boolean) =>
    `w-full rounded-lg border px-2.5 py-2.5 text-base ${
      hasError ? "border-maroon bg-maroon/5" : "border-black/10"
    }`;

  return (
    <div className="flex flex-col items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-8">
          {/* Full Name */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-black">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              placeholder="Enter your full name"
              className={getInputClass(!!errors.firstName || !!errors.lastName)}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {(errors.firstName || errors.lastName) && (
              <ErrorMessage
                message={
                  (errors.firstName?.message || errors.lastName?.message)!
                }
              />
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-black">
              Phone number
            </label>
            <div className="flex gap-3">
              <Controller
                name="phoneCountryCode"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value?.toString() || "45"}
                    onAction={(value) => field.onChange(Number(value))}
                    options={COUNTRY_CODES}
                    triggerWidth="w-fit gap-1!"
                  />
                )}
              />
              <input
                {...register("phoneNumber", { valueAsNumber: true })}
                type="number"
                placeholder="Phone number"
                className={`flex rounded-lg border px-2.5 py-2 ${
                  errors.phoneNumber
                    ? "border-maroon bg-maroon/5"
                    : "border-black/10"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <ErrorMessage message={errors.phoneNumber.message!} />
            )}
          </div>

          {/* Year of Birth */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-black">
              Year of birth
            </label>
            <Controller
              name="yearOfBirth"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value?.toString() || ""}
                  onAction={(value) => field.onChange(Number(value))}
                  options={YEAR_OPTIONS}
                  placeholder="Enter your year of birth"
                  error={!!errors.yearOfBirth}
                />
              )}
            />
            {errors.yearOfBirth && (
              <ErrorMessage message={errors.yearOfBirth.message!} />
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-black">
              Where do you live?
            </label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value || ""}
                  onAction={field.onChange}
                  options={NORDIC_CITIES}
                  placeholder="Enter your location"
                  error={!!errors.location}
                />
              )}
            />
            {errors.location && (
              <ErrorMessage message={errors.location.message!} />
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

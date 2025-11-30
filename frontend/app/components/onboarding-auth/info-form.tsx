// frontend/app/components/onboarding-auth/info-form.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  basicInfoSchema,
  type BasicInfoFormData,
} from "@/app/lib/schemas/auth-schema";
import { useAppStore } from "@/app/lib/stores/app-store";
import { Button } from "@/app/components/ui/buttons";
import { CustomSelect } from "@/app/components/ui/select";
import { Combobox } from "@/app/components/ui/combobox";
import { NORDIC_CITIES as OPTIONS } from "@/app/lib/constants/onboarding";
import { ErrorMessage } from "../ui/error-message";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";

interface CountryCodeDisplayProps {
  flag: string;
  code: string;
}

const CountryCodeDisplay = ({ flag, code }: CountryCodeDisplayProps) => (
  <span className="flex items-center gap-2">
    <span>{flag}</span>
    <span>{code}</span>
  </span>
);

const COUNTRY_CODES = [
  {
    value: "+45",
    label: "🇩🇰 +45",
    display: <CountryCodeDisplay flag="🇩🇰" code="+45" />,
  },
  {
    value: "+46",
    label: "🇸🇪 +46",
    display: <CountryCodeDisplay flag="🇸🇪" code="+46" />,
  },
  {
    value: "+47",
    label: "🇳🇴 +47",
    display: <CountryCodeDisplay flag="🇳🇴" code="+47" />,
  },
  {
    value: "+358",
    label: "🇫🇮 +358",
    display: <CountryCodeDisplay flag="🇫🇮" code="+358" />,
  },
  {
    value: "+354",
    label: "🇮🇸 +354",
    display: <CountryCodeDisplay flag="🇮🇸" code="+354" />,
  },
];

export function OnboardingBasicInfoForm() {
  const { onboarding, update_onboarding_data } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

  const [fullName, setFullName] = useState(
    [onboarding.data.first_name, onboarding.data.last_name]
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
      first_name: onboarding.data.first_name || "",
      last_name: onboarding.data.last_name || "",
      country_code: onboarding.data.phone_country_code
        ? `+${onboarding.data.phone_country_code}`
        : "+45",
      phone_number: onboarding.data.phone_number?.toString() || "",
      year_of_birth: onboarding.data.year_of_birth?.toString() || "",
      location: onboarding.data.location || "",
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    update_onboarding_data({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_country_code: parseInt(formData.country_code.replace("+", ""), 10),
      phone_number: parseInt(formData.phone_number, 10),
      year_of_birth: Number(formData.year_of_birth),
      location: formData.location,
    });
    nextStep();
  };

  const handleNameChange = (value: string) => {
    setFullName(value);
    const nameParts = value.trim().split(/\s+/);

    if (nameParts.length >= 2) {
      setValue("first_name", nameParts[0], { shouldValidate: true });
      setValue("last_name", nameParts.slice(1).join(" "), {
        shouldValidate: true,
      });
    } else {
      setValue("first_name", value.trim(), { shouldValidate: true });
      setValue("last_name", "", { shouldValidate: true });
    }
  };

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
              className={`w-full rounded-lg border px-2.5 py-2.5 text-base ${
                errors.first_name || errors.last_name
                  ? "border-maroon bg-maroon/5"
                  : "border-black/10"
              }`}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {(errors.first_name || errors.last_name) && (
              <ErrorMessage
                message={
                  errors.first_name?.message || errors.last_name?.message || ""
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
                name="country_code"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onAction={field.onChange}
                    options={COUNTRY_CODES}
                    triggerWidth="w-fit gap-1!"
                  />
                )}
              />
              <input
                {...register("phone_number")}
                type="tel"
                placeholder="Phone number"
                className={`flex rounded-lg border px-2.5 py-2 ${
                  errors.phone_number
                    ? "border-maroon bg-maroon/5"
                    : "border-black/10"
                }`}
              />
            </div>
            {errors.phone_number && (
              <ErrorMessage message={errors.phone_number.message || ""} />
            )}
          </div>

          {/* Year of Birth */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold text-black">
              Year of birth
            </label>
            <Controller
              name="year_of_birth"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onAction={field.onChange}
                  options={Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - 13 - i
                  ).map((year) => ({
                    value: year.toString(),
                    label: year.toString(),
                  }))}
                  placeholder="Enter your year of birth"
                  error={!!errors.year_of_birth}
                />
              )}
            />
            {errors.year_of_birth && (
              <ErrorMessage message={errors.year_of_birth.message || ""} />
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
                  value={field.value}
                  onAction={field.onChange}
                  options={OPTIONS}
                  placeholder="Enter your location"
                  error={!!errors.location}
                />
              )}
            />
            {errors.location && (
              <ErrorMessage message={errors.location.message || ""} />
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

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
  const { onboarding, updateOnboardingData } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

  // State to track the full name input
  const [fullName, setFullName] = useState(
    onboarding.data.firstName && onboarding.data.lastName ? `${onboarding.data.firstName} ${onboarding.data.lastName}` : ""
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
      firstName: onboarding.data.firstName || "",
      lastName: onboarding.data.lastName || "",
      countryCode: onboarding.data.phoneCountryCode || "+45",
      phoneNumber: onboarding.data.phoneNumber || "",
      yearOfBirth: onboarding.data.yearOfBirth?.toString() || "",
      city: onboarding.data.location || "",
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    updateOnboardingData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneCountryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      yearOfBirth: Number(formData.yearOfBirth),
      location: formData.city,
    });
    nextStep();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit(
          (data) => {
            console.log("Form submitted successfully", data);
            onSubmit(data);
          },
          (errors) => {
            console.log("Form validation errors", errors);
          }
        )}
        className="w-full"
      >
        <div className="flex flex-col gap-8">
          {/* Full Name */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              placeholder="Enter your full name"
              className={`w-full rounded-lg border px-2.5 py-2.5 text-base leading-normal tracking-[0.5px] placeholder:text-input-placeholder ${
                errors.firstName || errors.lastName
                  ? "border-maroon bg-maroon/5"
                  : "border-black/10"
              }`}
              onChange={(e) => {
                const value = e.target.value;
                setFullName(value);

                const nameParts = value.trim().split(/\s+/);

                if (nameParts.length >= 2) {
                  // First word is firstName, rest is lastName
                  const firstName = nameParts[0];
                  const lastName = nameParts.slice(1).join(" ");
                  setValue("firstName", firstName, { shouldValidate: true });
                  setValue("lastName", lastName, { shouldValidate: true });
                } else if (nameParts.length === 1 && nameParts[0]) {
                  // Only one word entered - set as firstName
                  setValue("firstName", nameParts[0], { shouldValidate: true });
                  setValue("lastName", "", { shouldValidate: true });
                } else {
                  // Empty input
                  setValue("firstName", "", { shouldValidate: true });
                  setValue("lastName", "", { shouldValidate: true });
                }
              }}
            />
            {(errors.firstName || errors.lastName) && (
              <ErrorMessage
                message={
                  errors.firstName?.message || errors.lastName?.message || ""
                }
              />
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
              Phone number
            </label>
            <div className="flex gap-3">
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onAction={field.onChange}
                    options={COUNTRY_CODES.map((country) => ({
                      value: country.value,
                      label: country.label,
                      display: country.display,
                    }))}
                    triggerWidth="w-fit gap-1!"
                  />
                )}
              />
              <input
                {...register("phoneNumber")}
                type="tel"
                placeholder="Phone number"
                className={`flex rounded-lg border px-2.5 py-2 leading-normal tracking-[0.5px] placeholder:text-input-placeholder ${
                  errors.phoneNumber ? "border-maroon bg-maroon/5" : "border-black/10"
                }`}
              />
            </div>
            {errors.phoneNumber && (
              <ErrorMessage message={errors.phoneNumber.message || ""} />
            )}
          </div>

          {/* Year of Birth */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
              Year of birth
            </label>
            <Controller
              name="yearOfBirth"
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
                  error={!!errors.yearOfBirth}
                />
              )}
            />
            {errors.yearOfBirth && (
              <ErrorMessage message={errors.yearOfBirth.message || ""} />
            )}
          </div>

          {/* Where do you live? */}
          <div className="flex flex-col gap-4">
            <label className="text-lg font-semibold leading-[19px] tracking-[0.5px] text-black">
              Where do you live?
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value}
                  onAction={field.onChange}
                  options={OPTIONS}
                  placeholder="Enter your city"
                  error={!!errors.city}
                />
              )}
            />
            {errors.city && (
              <ErrorMessage message={errors.city.message || ""} />
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

// src/entities/auth/auth.dto.ts
import {
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

/**
 * DTO for completing profile after Auth account creation
 * Used when Supabase Auth account already exists but profile needs to be created
 */
export class CompleteProfileDto {
  @IsString({ message: "Username is required" })
  @Length(3, 30, {
    message: "Username must be between 3 and 30 characters",
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username must contain only letters, numbers, and underscores",
  })
  username!: string;

  @IsString({ message: "First name is required" })
  @Length(1, 50, { message: "First name is required" })
  first_name!: string;

  @IsString({ message: "Last name is required" })
  @Length(1, 50, { message: "Last name is required" })
  last_name!: string;

  @IsNumber({}, { message: "Country code is required" })
  @Min(1, { message: "Invalid country code" })
  @Max(999, { message: "Invalid country code" })
  phone_country_code!: number;

  @IsNumber({}, { message: "Phone number is required" })
  @Min(1000, { message: "Phone number must be at least 4 digits" })
  @Max(999999999999999, { message: "Phone number must be at most 15 digits" })
  phone_number!: number;

  @IsNumber({}, { message: "Year of birth is required" })
  @ValidateIf((o) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear - 13;
    return o.year_of_birth >= minYear && o.year_of_birth <= maxYear;
  })
  @Min(1900, { message: "Year of birth must be after 1900" })
  @Max(new Date().getFullYear() - 13, {
    message: "You must be at least 13 years old",
  })
  year_of_birth!: number;

  @IsString({ message: "Location is required" })
  @Length(1, 100, { message: "Location must be 100 characters or less" })
  location!: string;

  @IsEnum(["musician", "service_provider", "other"], {
    message: "User type must be 'musician', 'service_provider', or 'other'",
  })
  user_type!: "musician" | "service_provider" | "other";
}

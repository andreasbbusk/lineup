// src/entities/auth/auth.dto.ts
import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  Length,
  Min,
  Max,
  Matches,
  ValidateIf,
} from "class-validator";

/**
 * DTO for user signup
 * Validates all required fields for creating a new user account
 */
export class SignupDto {
  @IsEmail({}, { message: "Invalid email format" })
  @Length(10, 60, { message: "Email must between 10 and 60 characters" })
  email!: string;

  @IsString({ message: "Password is required" })
  @Length(6, 60, {
    message: "Password must be between 6 and 60 characters",
  })
  @Matches(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  @Matches(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  @Matches(/[0-9]/, {
    message: "Password must contain at least one number",
  })
  password!: string;

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
  firstName!: string;

  @IsString({ message: "Last name is required" })
  @Length(1, 50, { message: "Last name is required" })
  lastName!: string;

  @IsNumber({}, { message: "Country code is required" })
  @Min(1, { message: "Invalid country code" })
  @Max(999, { message: "Invalid country code" })
  phoneCountryCode!: number;

  @IsNumber({}, { message: "Phone number is required" })
  @Min(1000, { message: "Phone number must be at least 4 digits" })
  @Max(999999999999999, { message: "Phone number must be at most 15 digits" })
  phoneNumber!: number;

  @IsNumber({}, { message: "Year of birth is required" })
  @ValidateIf((o) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear - 13;
    return o.yearOfBirth >= minYear && o.yearOfBirth <= maxYear;
  })
  @Min(1900, { message: "Year of birth must be after 1900" })
  @Max(new Date().getFullYear() - 13, {
    message: "You must be at least 13 years old",
  })
  yearOfBirth!: number;

  @IsString({ message: "Location is required" })
  @Length(1, 100, { message: "Location must be 100 characters or less" })
  location!: string;

  @IsEnum(["musician", "service_provider", "other"], {
    message: "User type must be 'musician', 'service_provider', or 'other'",
  })
  userType!: "musician" | "service_provider" | "other";
}

/**
 * DTO for user login
 */
export class LoginDto {
  @IsEmail({}, { message: "Invalid email format" })
  @IsString({ message: "Email is required" })
  email!: string;

  @IsString({ message: "Password is required" })
  @Length(1, 128, { message: "Password is required" })
  password!: string;
}

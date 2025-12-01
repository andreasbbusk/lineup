import {
  IsEmail,
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
 * DTO for user signup
 *
 * Validates all required fields for creating a new user account.
 * The username, email, and phone number combination must be unique.
 *
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123",
 *   "username": "johndoe",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phoneCountryCode": 1,
 *   "phoneNumber": 1234567890,
 *   "yearOfBirth": 1990,
 *   "location": "New York, NY",
 *   "userType": "musician"
 * }
 */
export class SignupDto {
  /**
   * User's email address (10-60 characters)
   * @example "user@example.com"
   */
  @IsEmail({}, { message: "Invalid email format" })
  @Length(10, 60, { message: "Email must between 10 and 60 characters" })
  email!: string;

  /**
   * Password (6-60 characters, must contain uppercase, lowercase, and number)
   * @example "SecurePass123"
   */
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

  /**
   * Unique username (3-30 characters, alphanumeric and underscores only)
   * @example "johndoe"
   */
  @IsString({ message: "Username is required" })
  @Length(3, 30, {
    message: "Username must be between 3 and 30 characters",
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username must contain only letters, numbers, and underscores",
  })
  username!: string;

  /**
   * First name (2-50 characters)
   * @example "John"
   */
  @IsString({ message: "First name is required" })
  @Length(2, 50, { message: "First name must be between 2 and 50 characters" })
  firstName!: string;

  /**
   * Last name (2-50 characters)
   * @example "Doe"
   */
  @IsString({ message: "Last name is required" })
  @Length(2, 50, { message: "Last name must be between 2 and 50 characters" })
  lastName!: string;

  /**
   * Phone country code (1-999)
   * @example 1
   */
  @IsNumber({}, { message: "Country code is required" })
  @Min(1, { message: "Invalid country code" })
  @Max(999, { message: "Invalid country code" })
  phoneCountryCode!: number;

  /**
   * Phone number (4-15 digits)
   * @example 1234567890
   */
  @IsNumber({}, { message: "Phone number is required" })
  @Min(1000, { message: "Phone number must be at least 4 digits" })
  @Max(999999999999999, { message: "Phone number must be at most 15 digits" })
  phoneNumber!: number;

  /**
   * Year of birth (must be 13+ years old)
   * @example 1990
   */
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

  /**
   * User's location (1-100 characters)
   * @example "New York, NY"
   */
  @IsString({ message: "Location is required" })
  @Length(1, 100, { message: "Location must be 100 characters or less" })
  location!: string;

  /**
   * User type: "musician", "service_provider", or "other"
   * @example "musician"
   */
  @IsEnum(["musician", "service_provider", "other"], {
    message: "User type must be 'musician', 'service provider', or 'other'",
  })
  userType!: "musician" | "service_provider" | "other";
}

/**
 * DTO for user login
 *
 * Used to authenticate an existing user with their email and password.
 *
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "SecurePass123"
 * }
 */
export class LoginDto {
  /**
   * User's email address
   * @example "user@example.com"
   */
  @IsEmail({}, { message: "Invalid email format" })
  @IsString({ message: "Email is required" })
  email!: string;

  /**
   * User's password
   * @example "SecurePass123"
   */
  @IsString({ message: "Password is required" })
  @Length(1, 128, { message: "Password is required" })
  password!: string;
}

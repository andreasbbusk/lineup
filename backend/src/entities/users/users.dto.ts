// src/entities/users/users.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  Length,
  Matches,
} from "class-validator";
import { ProfileUpdateRequest } from "../../types/api.types.js";

/**
 * DTO for updating user profile
 *
 * Used to update user profile information. All fields are optional - only
 * provided fields will be updated. The user_id is automatically extracted
 * from the authentication token.
 *
 * @example
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "bio": "Musician from New York",
 *   "location": "New York, NY",
 *   "themeColor": "#FF5733"
 * }
 */
export class UpdateProfileDto implements ProfileUpdateRequest {
  /**
   * Username (3-30 characters, only for initial profile creation)
   * @example "johndoe"
   */
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username must contain only letters, numbers, and underscores",
  })
  username?: string;

  /**
   * First name (1-50 characters)
   * @example "John"
   */
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  /**
   * Last name (1-50 characters)
   * @example "Doe"
   */
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  /**
   * Short bio (max 100 characters)
   * @example "Musician from New York"
   */
  @IsOptional()
  @IsString()
  @Length(0, 100)
  bio?: string;

  /**
   * Detailed about me section (max 500 characters)
   * @example "I'm a professional musician with 10 years of experience..."
   */
  @IsOptional()
  @IsString()
  @Length(0, 500)
  aboutMe?: string;

  /**
   * URL to user's avatar image
   * @example "https://example.com/avatar.jpg"
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  /**
   * User's location (1-100 characters)
   * @example "New York, NY"
   */
  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string;

  /**
   * Theme color in hex format
   * @example "#FF5733"
   */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "Theme color must be a valid hex color (e.g., #FF5733)",
  })
  themeColor?: string;

  /**
   * URL to Spotify playlist
   * @example "https://open.spotify.com/playlist/..."
   */
  @IsOptional()
  @IsString()
  spotifyPlaylistUrl?: string;

  /**
   * Phone country code (1-999)
   * @example 1
   */
  @IsOptional()
  @IsNumber()
  phoneCountryCode?: number;

  /**
   * Phone number (4-15 digits)
   * @example 1234567890
   */
  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  /**
   * Year of birth
   * @example 1990
   */
  @IsOptional()
  @IsNumber()
  yearOfBirth?: number;

  /**
   * User type: "musician", "service_provider", or "other"
   * @example "musician"
   */
  @IsOptional()
  @IsString()
  userType?: string;

  /**
   * Whether user has completed onboarding
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  /**
   * Types of connections user is looking for
   * @example ["connect", "find-band"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lookingFor?: string[];
}

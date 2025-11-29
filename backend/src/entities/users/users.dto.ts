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
 * Matches ProfileUpdateRequest API format (camelCase)
 */
export class UpdateProfileDto implements ProfileUpdateRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  aboutMe?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "Theme color must be a valid hex color (e.g., #FF5733)",
  })
  themeColor?: string;

  @IsOptional()
  @IsString()
  spotifyPlaylistUrl?: string;

  @IsOptional()
  @IsNumber()
  phoneCountryCode?: number;

  @IsOptional()
  @IsNumber()
  phoneNumber?: number;

  @IsOptional()
  @IsNumber()
  yearOfBirth?: number;

  @IsOptional()
  @IsString()
  userType?: string;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lookingFor?: string[];
}

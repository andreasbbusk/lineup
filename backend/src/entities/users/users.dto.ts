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
 * Matches ProfileUpdateRequest API format (snake_case)
 */
export class UpdateProfileDto implements ProfileUpdateRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  first_name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  last_name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  about_me?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  location?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: "Theme color must be a valid hex color (e.g., #FF5733)",
  })
  theme_color?: string;

  @IsOptional()
  @IsString()
  spotify_playlist_url?: string;

  @IsOptional()
  @IsNumber()
  phone_country_code?: number;

  @IsOptional()
  @IsNumber()
  phone_number?: number;

  @IsOptional()
  @IsNumber()
  year_of_birth?: number;

  @IsOptional()
  @IsString()
  user_type?: string;

  @IsOptional()
  @IsBoolean()
  onboarding_completed?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  looking_for?: string[];
}

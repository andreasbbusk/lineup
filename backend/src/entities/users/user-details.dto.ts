// DTOs for user details endpoints (social media, FAQ, looking for)
import {
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
  Length,
} from "class-validator";

/**
 * DTO for updating user social media links
 */
export class UpdateSocialMediaDto {
  @IsOptional()
  @IsString()
  @Length(0, 200)
  instagram?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  twitter?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  facebook?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  youtube?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  soundcloud?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  tiktok?: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bandcamp?: string | null;
}

/**
 * DTO for creating/updating user FAQ answer
 */
export class UpsertFaqDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  @Length(1, 500)
  answer!: string;
}

/**
 * DTO for deleting FAQ answer
 */
export class DeleteFaqDto {
  @IsUUID()
  questionId!: string;
}

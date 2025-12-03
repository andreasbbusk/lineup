import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Length,
} from "class-validator";
import { ConversationType } from "../../utils/supabase-helpers.js";

export class CreateConversationDto {
  @IsEnum(["direct", "group"])
  type!: ConversationType;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string | null;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @IsArray()
  @IsUUID(4, { each: true })
  participantIds!: string[];
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string | null;

  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}

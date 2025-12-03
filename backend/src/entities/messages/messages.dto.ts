import { IsString, IsUUID, IsOptional, IsArray, Length } from "class-validator";

export class SendMessageDto {
  @IsUUID()
  conversation_id!: string;

  @IsString()
  @Length(1, 5000)
  content!: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  media_ids?: string[];

  @IsOptional()
  @IsUUID()
  reply_to_message_id?: string | null;
}

export class EditMessageDto {
  @IsString()
  @Length(1, 5000)
  content!: string;
}

export class MarkMessagesReadDto {
  @IsArray()
  @IsUUID(4, { each: true })
  message_ids!: string[];
}

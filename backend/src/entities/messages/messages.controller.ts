import { Request as ExpressRequest } from "express";
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import {
  EditMessageDto,
  MarkMessagesReadDto,
  SendMessageDto,
} from "./messages.dto.js";
import { MessagesService } from "./messages.service.js";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import type {
  PaginatedMessagesResponse,
  MessageResponse,
} from "../../types/api.types.js";

@Route("messages")
@Tags("Messages")
export class MessagesController extends Controller {
  private service = new MessagesService();

  @Get("{conversationId}")
  @Security("bearerAuth")
  public async getMessages(
    @Path() conversationId: string,
    @Request() req: ExpressRequest,
    @Query() limit?: number,
    @Query() before_message_id?: string
  ): Promise<PaginatedMessagesResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.getMessages(userId, conversationId, {
        before_message_id,
        limit: limit ?? 50,
      });
    });
  }

  @Post()
  @Security("bearerAuth")
  public async sendMessage(
    @Body() dto: SendMessageDto,
    @Request() req: ExpressRequest
  ): Promise<MessageResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.service.sendMessage(userId, dto);
      },
      201
    );
  }

  @Put("{messageId}")
  @Security("bearerAuth")
  public async editMessage(
    @Path() messageId: string,
    @Body() dto: EditMessageDto,
    @Request() req: ExpressRequest
  ) {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.editMessage(userId, messageId, dto);
    });
  }

  @Delete("{messageId}")
  @Security("bearerAuth")
  public async deleteMessage(
    @Path() messageId: string,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.service.deleteMessage(userId, messageId);
      },
      204
    );
  }

  @Post("read")
  @Security("bearerAuth")
  public async markAsRead(
    @Body() dto: MarkMessagesReadDto,
    @Request() req: ExpressRequest
  ) {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.markAsRead(userId, dto.message_ids);
    });
  }

  @Post("typing/{conversationId}")
  @Security("bearerAuth")
  public async setTyping(
    @Path() conversationId: string,
    @Query() isTyping: boolean = true,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        await this.service.setTypingIndicator(userId, conversationId, isTyping);
      },
      204
    );
  }
}

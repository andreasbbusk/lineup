import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { MessagesService } from "./messages.service.js";
import { CreateMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { MessageResponse } from "../../types/api.types.js";

@Route("conversations/{conversationId}/messages")
@Tags("Messages")
export class MessagesController extends Controller {
  private messagesService = new MessagesService();

  /**
   * Get messages in a conversation
   *
   * Returns messages for a specific conversation with sender info, read receipts,
   * and optional reply data. Supports cursor-based pagination.
   *
   * @summary Get conversation messages
   * @param conversationId The UUID of the conversation
   * @param cursor Cursor for pagination (ISO timestamp)
   * @param limit Maximum number of messages to return (1-100, default: 50)
   * @param before If true, fetch messages before the cursor (for loading older messages)
   * @returns Messages with pagination cursor
   * @throws 401 if not authenticated
   * @throws 404 if conversation not found or user is not a participant
   */
  @Security("bearerAuth")
  @Get("/")
  public async getConversationMessages(
    @Path() conversationId: string,
    @Query() cursor?: string,
    @Query() limit?: number,
    @Query() before?: boolean,
    @Request() request?: ExpressRequest
  ): Promise<{ messages: MessageResponse[]; nextCursor?: string }> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.messagesService.getConversationMessages(
        conversationId,
        userId,
        token,
        cursor,
        limit || 50,
        before || false
      );
    });
  }

  /**
   * Get a specific message by ID
   *
   * Returns a single message with all relations (sender, reply, read receipts, media).
   * Only participants in the conversation can access messages.
   *
   * @summary Get message by ID
   * @param conversationId The UUID of the conversation
   * @param messageId The UUID of the message to retrieve
   * @returns The message with all relations
   * @throws 401 if not authenticated
   * @throws 403 if user is not a participant
   * @throws 404 if message not found
   */
  @Security("bearerAuth")
  @Get("{messageId}")
  public async getMessage(
    @Path() conversationId: string,
    @Path() messageId: string,
    @Request() request?: ExpressRequest
  ): Promise<MessageResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.messagesService.getMessageById(messageId, userId, token);
    });
  }

  /**
   * Send a message in a conversation
   *
   * Creates a new message in the conversation. The message must have either
   * content or media. Only participants can send messages.
   *
   * @summary Send a message
   * @param conversationId The UUID of the conversation
   * @param body Message data including content, optional media, and optional reply
   * @returns The created message with all relations
   * @throws 400 if validation fails
   * @throws 401 if not authenticated
   * @throws 403 if user is not a participant
   * @throws 404 if conversation or reply message not found
   */
  @Security("bearerAuth")
  @Post("/")
  public async createMessage(
    @Path() conversationId: string,
    @Body() body: CreateMessageDto,
    @Request() request?: ExpressRequest
  ): Promise<MessageResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        return this.messagesService.createMessage(
          conversationId,
          userId,
          body,
          token
        );
      },
      201
    );
  }

  /**
   * Edit a message
   *
   * Updates the content of a message. Only the sender can edit their own messages,
   * and only within 15 minutes of sending.
   *
   * @summary Edit a message
   * @param conversationId The UUID of the conversation
   * @param messageId The UUID of the message to edit
   * @param body Updated message content
   * @returns The updated message
   * @throws 400 if validation fails or message is too old
   * @throws 401 if not authenticated
   * @throws 403 if user is not the sender
   * @throws 404 if message not found
   */
  @Security("bearerAuth")
  @Put("{messageId}")
  public async updateMessage(
    @Path() conversationId: string,
    @Path() messageId: string,
    @Body() body: UpdateMessageDto,
    @Request() request?: ExpressRequest
  ): Promise<MessageResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.messagesService.updateMessage(messageId, userId, body, token);
    });
  }

  /**
   * Delete a message
   *
   * Soft deletes a message. Only the sender can delete their own messages.
   * The message content is cleared but the message record remains.
   *
   * @summary Delete a message
   * @param conversationId The UUID of the conversation
   * @param messageId The UUID of the message to delete
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 403 if user is not the sender
   * @throws 404 if message not found
   */
  @Security("bearerAuth")
  @Delete("{messageId}")
  public async deleteMessage(
    @Path() conversationId: string,
    @Path() messageId: string,
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        return this.messagesService.deleteMessage(messageId, userId, token);
      },
      204
    );
  }

  /**
   * Mark messages as read
   *
   * Creates read receipts for messages in a conversation, indicating that
   * the authenticated user has read them.
   *
   * @summary Mark messages as read
   * @param conversationId The UUID of the conversation
   * @param body Array of message IDs to mark as read
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 403 if user is not a participant
   * @throws 404 if one or more messages not found
   */
  @Security("bearerAuth")
  @Post("/read")
  public async markMessagesAsRead(
    @Path() conversationId: string,
    @Body() body: { messageIds: string[] },
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        return this.messagesService.markMessagesAsRead(
          conversationId,
          userId,
          body.messageIds,
          token
        );
      },
      204
    );
  }
}

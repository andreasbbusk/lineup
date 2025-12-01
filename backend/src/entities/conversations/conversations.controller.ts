import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { ConversationsService } from "./conversations.service.js";
import {
  CreateConversationDto,
  UpdateConversationDto,
} from "./conversations.dto.js";
import { ConversationResponse } from "../../types/api.types.js";

@Route("conversations")
@Tags("Conversations")
export class ConversationsController extends Controller {
  private conversationsService = new ConversationsService();

  /**
   * Get all conversations for the authenticated user
   *
   * Returns all conversations where the authenticated user is an active participant.
   * Each conversation includes creator information and participant list.
   * Results are ordered by last message time (most recent first).
   *
   * @summary Get user's conversations
   * @returns Array of conversations with creator and participants
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/")
  public async getConversations(
    @Request() request: ExpressRequest
  ): Promise<ConversationResponse[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.conversationsService.getUserConversations(userId, token);
    });
  }

  /**
   * Get a conversation by ID
   *
   * Returns a specific conversation with creator and participants.
   * Only participants can access the conversation.
   *
   * @summary Get conversation by ID
   * @param conversationId The UUID of the conversation to retrieve
   * @returns The conversation with creator and participants
   * @throws 401 if not authenticated
   * @throws 404 if conversation not found or user is not a participant
   */
  @Security("bearerAuth")
  @Get("{conversationId}")
  public async getConversation(
    @Path() conversationId: string,
    @Request() request: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.conversationsService.getConversationById(
        conversationId,
        userId,
        token
      );
    });
  }

  /**
   * Create a conversation
   *
   * Creates a new direct message or group conversation.
   * For direct messages, provide exactly one participant ID.
   * For group conversations, provide multiple participant IDs (max 7, 8 total including creator).
   * Group conversations must have a name.
   *
   * @summary Create a conversation
   * @param body Conversation data including type, name (for groups), and participant IDs
   * @returns The created conversation with creator and participants
   * @throws 400 if validation fails
   * @throws 404 if one or more participants not found
   */
  @Security("bearerAuth")
  @Post("/")
  public async createConversation(
    @Body() body: CreateConversationDto,
    @Request() request: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.conversationsService.createConversation(
          userId,
          body,
          token
        );
      },
      201
    );
  }

  /**
   * Update a conversation
   *
   * Updates a group conversation's name or avatar.
   * Only the conversation creator or admins can update the conversation.
   * Direct conversations cannot be updated.
   *
   * @summary Update a conversation
   * @param conversationId The UUID of the conversation to update
   * @param body Updated conversation data (name, avatar_url)
   * @returns The updated conversation
   * @throws 400 if validation fails or conversation is direct
   * @throws 403 if user is not creator or admin
   * @throws 404 if conversation not found
   */
  @Security("bearerAuth")
  @Put("{conversationId}")
  public async updateConversation(
    @Path() conversationId: string,
    @Body() body: UpdateConversationDto,
    @Request() request: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.conversationsService.updateConversation(
        conversationId,
        userId,
        body,
        token
      );
    });
  }

  /**
   * Delete a conversation or leave a group
   *
   * For direct messages, marks the user as having left the conversation.
   * For group conversations, removes the user from participants.
   *
   * @summary Delete/leave a conversation
   * @param conversationId The UUID of the conversation to delete/leave
   * @returns No content on success
   * @throws 404 if conversation not found
   */
  @Security("bearerAuth")
  @Delete("{conversationId}")
  public async deleteConversation(
    @Path() conversationId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.conversationsService.deleteConversation(
          conversationId,
          userId,
          token
        );
      },
      204
    );
  }
}

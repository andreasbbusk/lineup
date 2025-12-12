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
  AddParticipantsDto,
} from "./conversations.dto.js";
import { ConversationResponse } from "../../types/api.types.js";

const getToken = (req: ExpressRequest) =>
  req.headers.authorization?.replace("Bearer ", "") || "";

@Route("conversations")
@Tags("Conversations")
export class ConversationsController extends Controller {
  private service = new ConversationsService();

  @Security("bearerAuth")
  @Get("/")
  public async getConversations(
    @Request() req: ExpressRequest
  ): Promise<ConversationResponse[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.getUserConversations(userId, getToken(req));
    });
  }

  @Security("bearerAuth")
  @Get("unread-count")
  public async getUnreadCount(
    @Request() req: ExpressRequest
  ): Promise<{ unread_count: number }> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.getUnreadCount(userId, getToken(req));
    });
  }

  @Security("bearerAuth")
  @Get("{conversationId}")
  public async getConversation(
    @Path() conversationId: string,
    @Request() req: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.getConversationById(
        conversationId,
        userId,
        getToken(req)
      );
    });
  }

  @Security("bearerAuth")
  @Post("/")
  public async createConversation(
    @Body() body: CreateConversationDto,
    @Request() req: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.service.createConversation(userId, body, getToken(req));
      },
      201
    );
  }

  @Security("bearerAuth")
  @Put("{conversationId}")
  public async updateConversation(
    @Path() conversationId: string,
    @Body() body: UpdateConversationDto,
    @Request() req: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(req);
      return this.service.updateConversation(
        conversationId,
        userId,
        body,
        getToken(req)
      );
    });
  }

  @Security("bearerAuth")
  @Delete("{conversationId}")
  public async deleteConversation(
    @Path() conversationId: string,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.service.deleteConversation(
          conversationId,
          userId,
          getToken(req)
        );
      },
      204
    );
  }

  @Security("bearerAuth")
  @Post("{conversationId}/participants")
  public async addParticipants(
    @Path() conversationId: string,
    @Body() body: AddParticipantsDto,
    @Request() req: ExpressRequest
  ): Promise<ConversationResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.service.addParticipants(
          conversationId,
          userId,
          body.participantIds,
          getToken(req)
        );
      },
      201
    );
  }

  @Security("bearerAuth")
  @Delete("{conversationId}/participants/{userId}")
  public async removeParticipant(
    @Path() conversationId: string,
    @Path() userId: string,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const requesterId = await extractUserId(req);
        return this.service.removeParticipant(
          conversationId,
          requesterId,
          userId,
          getToken(req)
        );
      },
      204
    );
  }
}

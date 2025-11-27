import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Delete,
  Path,
  Body,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { CollaborationsService } from "./collaborations.service.js";
import { CreateCollaborationDto } from "./collaborations.dto.js";
import { CollaborationResponse } from "../../types/api.types.js";

@Route("collaborations")
@Tags("Collaborations")
export class CollaborationsController extends Controller {
  private collaborationsService = new CollaborationsService();

  /**
   * Get all collaborations for the authenticated user
   *
   * Returns a list of all collaborations where the authenticated user is involved.
   * Each collaboration includes the collaborator's profile information.
   *
   * @summary Get user's collaborations
   * @returns Array of collaborations with collaborator details
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/")
  public async getCollaborations(
    @Request() request: ExpressRequest
  ): Promise<CollaborationResponse[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.collaborationsService.getUserCollaborations(userId, token);
    });
  }

  /**
   * Get collaborations for a specific user
   *
   * Returns all collaborations for the specified user. This endpoint can be
   * accessed without authentication to view public collaboration information.
   *
   * @summary Get collaborations by user ID
   * @param userId The UUID of the user to retrieve collaborations for
   * @returns Array of collaborations with collaborator details
   * @throws 404 if user not found
   */
  /**
   * Get collaborations for a specific user
   *
   * Returns all collaborations for the specified user. This endpoint can be
   * accessed without authentication to view public collaboration information.
   *
   * @summary Get collaborations by user ID
   * @param userId The UUID of the user to retrieve collaborations for
   * @returns Array of collaborations with collaborator details
   * @throws 404 if user not found
   */
  @Get("{userId}")
  public async getUserCollaborations(
    @Path() userId: string
  ): Promise<CollaborationResponse[]> {
    return handleControllerRequest(this, async () => {
      return this.collaborationsService.getUserCollaborationsPublic(userId);
    });
  }

  /**
   * Create a collaboration
   *
   * Allows the authenticated user to record a past collaboration with another user.
   * The collaborator must exist and the collaboration must not already exist.
   *
   * @summary Create a collaboration
   * @param body Collaboration data including collaborator ID and optional description
   * @returns The created collaboration
   * @throws 400 if validation fails or user tries to collaborate with themselves
   * @throws 404 if collaborator not found
   * @throws 409 if collaboration already exists
   */
  @Security("bearerAuth")
  @Post("/")
  public async createCollaboration(
    @Body() body: CreateCollaborationDto,
    @Request() request: ExpressRequest
  ): Promise<CollaborationResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.collaborationsService.createCollaboration(
          userId,
          body.collaborator_id,
          body.description,
          token
        );
      },
      201
    );
  }

  /**
   * Delete a collaboration
   *
   * Removes a collaboration. Only the user who created the collaboration
   * can delete it.
   *
   * @summary Delete a collaboration
   * @param collaborationId The UUID of the collaboration to delete
   * @returns No content on success
   * @throws 404 if collaboration not found
   * @throws 403 if user doesn't own the collaboration
   */
  @Security("bearerAuth")
  @Delete("{collaborationId}")
  public async deleteCollaboration(
    @Path() collaborationId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.collaborationsService.deleteCollaboration(
          userId,
          collaborationId,
          token
        );
      },
      204
    );
  }
}

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
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { ConnectionsService } from "./connections.service.js";
import {
  CreateConnectionRequestDto,
  UpdateConnectionRequestDto,
} from "./connections.dto.js";
import { Connection } from "../../types/api.types.js";

@Route("connections")
@Tags("Connections")
export class ConnectionsController extends Controller {
  private connectionsService = new ConnectionsService();

  /**
   * Get all connection requests for the authenticated user
   *
   * Returns both sent and received connection requests for the authenticated user.
   * Each request includes requester and recipient profile information.
   *
   * @summary Get user's connection requests
   * @returns Array of connection requests (sent and received)
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/")
  public async getConnectionRequests(
    @Request() request: ExpressRequest
  ): Promise<Connection[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.connectionsService.getUserConnectionRequests(userId, token);
    });
  }

  /**
   * Get connection requests sent by a user
   *
   * Returns all connection requests sent by the specified user.
   * This endpoint can be accessed without authentication.
   *
   * @summary Get sent connection requests by user
   * @param userId The UUID of the user to retrieve sent requests for
   * @returns Array of connection requests sent by the user
   */
  @Get("sent/{userId}")
  public async getSentConnectionRequests(
    @Path() userId: string
  ): Promise<Connection[]> {
    return handleControllerRequest(this, async () => {
      return this.connectionsService.getSentConnectionRequests(userId);
    });
  }

  /**
   * Get connection requests received by a user
   *
   * Returns all connection requests received by the specified user.
   * This endpoint can be accessed without authentication.
   *
   * @summary Get received connection requests by user
   * @param userId The UUID of the user to retrieve received requests for
   * @returns Array of connection requests received by the user
   */
  @Get("received/{userId}")
  public async getReceivedConnectionRequests(
    @Path() userId: string
  ): Promise<Connection[]> {
    return handleControllerRequest(this, async () => {
      return this.connectionsService.getReceivedConnectionRequests(userId);
    });
  }

  /**
   * Create a connection request
   *
   * Allows the authenticated user to send a connection request to another user.
   * The recipient must exist and there must not be an existing connection request.
   *
   * @summary Send a connection request
   * @param body Connection request data including recipient ID
   * @returns The created connection request
   * @throws 400 if validation fails or user tries to connect with themselves
   * @throws 404 if recipient not found
   * @throws 409 if connection request already exists
   */
  @Security("bearerAuth")
  @Post("/")
  public async createConnectionRequest(
    @Body() body: CreateConnectionRequestDto,
    @Request() request: ExpressRequest
  ): Promise<Connection> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.connectionsService.createConnectionRequest(
          userId,
          body,
          token
        );
      },
      201
    );
  }

  /**
   * Update a connection request status
   *
   * Allows the recipient to accept or reject a connection request.
   * Only the recipient can update the status, and only pending requests can be updated.
   *
   * @summary Accept or reject a connection request
   * @param requestId The UUID of the connection request to update
   * @param body Updated status (accepted or rejected)
   * @returns The updated connection request
   * @throws 400 if validation fails or request is not pending
   * @throws 403 if user is not the recipient
   * @throws 404 if connection request not found
   */
  @Security("bearerAuth")
  @Put("{requestId}")
  public async updateConnectionRequest(
    @Path() requestId: string,
    @Body() body: UpdateConnectionRequestDto,
    @Request() request: ExpressRequest
  ): Promise<Connection> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.connectionsService.updateConnectionRequest(
        requestId,
        userId,
        body,
        token
      );
    });
  }

  /**
   * Delete a connection request
   *
   * Removes a connection request. Only the requester can delete a pending request.
   *
   * @summary Delete a connection request
   * @param requestId The UUID of the connection request to delete
   * @returns No content on success
   * @throws 403 if user is not the requester
   * @throws 404 if connection request not found
   */
  @Security("bearerAuth")
  @Delete("{requestId}")
  public async deleteConnectionRequest(
    @Path() requestId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.connectionsService.deleteConnectionRequest(
          requestId,
          userId,
          token
        );
      },
      204
    );
  }
}

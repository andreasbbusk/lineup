// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../entities/users/users.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UploadController } from './../entities/upload/upload.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MediaController } from './../entities/upload/upload.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SearchController } from './../entities/search/search.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ReviewsController } from './../entities/reviews/reviews.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ReviewsByIdController } from './../entities/reviews/reviews.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PostsController } from './../entities/posts/posts.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationsController } from './../entities/notifications/notifications.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MetadataController } from './../entities/metadata/metadata.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MessagesController } from './../entities/messages/messages.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FeedController } from './../entities/feed/feed.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConversationsController } from './../entities/conversations/conversations.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConnectionsController } from './../entities/connections/connections.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CommentsController } from './../entities/comments/comments.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CollaborationsController } from './../entities/collaborations/collaborations.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BookmarksController } from './../entities/bookmarks/bookmarks.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../entities/auth/auth.controller';
import { expressAuthentication } from './../middleware/authentication';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';


const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;

function authenticateMiddleware(security: TsoaRoute.Security[]): RequestHandler {
    return async (req: ExRequest, res: ExResponse, next: any) => {
        try {
            for (const securityGroup of security) {
                // Handle both array and object security groups
                if (Array.isArray(securityGroup)) {
                    // If it's an array, iterate over elements (each element is an object with security names)
                    for (const securityObj of securityGroup) {
                        for (const securityName of Object.keys(securityObj)) {
                            await expressAuthenticationRecasted(req, securityName, securityObj[securityName], res);
                        }
                    }
                } else {
                    // If it's an object, iterate over keys directly
                    for (const securityName of Object.keys(securityGroup)) {
                        await expressAuthenticationRecasted(req, securityName, securityGroup[securityName], res);
                    }
                }
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "UserProfile": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"username":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"lastName":{"dataType":"string","required":true},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"bio":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"aboutMe":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"phoneCountryCode":{"dataType":"double"},"phoneNumber":{"dataType":"double"},"yearOfBirth":{"dataType":"double"},"location":{"dataType":"string","required":true},"userType":{"dataType":"string","required":true},"themeColor":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"spotifyPlaylistUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"onboardingCompleted":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true}},"additionalProperties":false},
    "LookingForType": {"dataType":"refAlias","type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["connect"]},{"dataType":"enum","enums":["promote"]},{"dataType":"enum","enums":["find-band"]},{"dataType":"enum","enums":["find-services"]}],"validators":{}}},
    "UpdateProfileDto": {"dataType":"refObject","properties":{"username":{"dataType":"string"},"firstName":{"dataType":"string"},"lastName":{"dataType":"string"},"bio":{"dataType":"string"},"aboutMe":{"dataType":"string"},"avatarUrl":{"dataType":"string"},"location":{"dataType":"string"},"themeColor":{"dataType":"string"},"spotifyPlaylistUrl":{"dataType":"string"},"phoneCountryCode":{"dataType":"double"},"phoneNumber":{"dataType":"double"},"yearOfBirth":{"dataType":"double"},"userType":{"dataType":"string"},"onboardingCompleted":{"dataType":"boolean"},"lookingFor":{"dataType":"array","array":{"dataType":"refAlias","ref":"LookingForType"}}},"additionalProperties":false},
    "SignedUrlResponse": {"dataType":"refObject","properties":{"signedUrl":{"dataType":"string","required":true},"filePath":{"dataType":"string","required":true}},"additionalProperties":false},
    "SignedUrlRequestDto": {"dataType":"refObject","properties":{"fileName":{"dataType":"string","required":true},"fileType":{"dataType":"string","required":true},"uploadType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["post"]},{"dataType":"enum","enums":["avatar"]}],"default":"post"}},"additionalProperties":false},
    "UserSearchResult": {"dataType":"refObject","properties":{"type":{"dataType":"enum","enums":["user"],"required":true},"id":{"dataType":"string","required":true},"username":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"lastName":{"dataType":"string","required":true},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"bio":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"genres":{"dataType":"any"},"lookingFor":{"dataType":"array","array":{"dataType":"string"}},"isConnected":{"dataType":"boolean","required":true},"relevance":{"dataType":"double","required":true}},"additionalProperties":false},
    "CollaborationSearchResult": {"dataType":"refObject","properties":{"type":{"dataType":"enum","enums":["collaboration"],"required":true},"id":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"description":{"dataType":"string","required":true},"authorId":{"dataType":"string","required":true},"authorUsername":{"dataType":"string","required":true},"authorAvatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"paidOpportunity":{"dataType":"boolean","required":true},"genres":{"dataType":"any"},"createdAt":{"dataType":"string","required":true},"relevance":{"dataType":"double","required":true}},"additionalProperties":false},
    "TagSearchResult": {"dataType":"refObject","properties":{"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["genre"]},{"dataType":"enum","enums":["artist"]}],"required":true},"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"usageCount":{"dataType":"double","required":true},"relevance":{"dataType":"double","required":true}},"additionalProperties":false},
    "ForYouSearchResult": {"dataType":"refObject","properties":{"type":{"dataType":"enum","enums":["for_you"],"required":true},"entityType":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["user"]},{"dataType":"enum","enums":["collaboration"]}],"required":true},"entityId":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"subtitle":{"dataType":"string","required":true},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"matchReason":{"dataType":"string","required":true},"additionalInfo":{"dataType":"any"},"relevance":{"dataType":"double","required":true}},"additionalProperties":false},
    "SearchResult": {"dataType":"refAlias","type":{"dataType":"union","subSchemas":[{"ref":"UserSearchResult"},{"ref":"CollaborationSearchResult"},{"ref":"TagSearchResult"},{"ref":"ForYouSearchResult"}],"validators":{}}},
    "SearchResponse": {"dataType":"refObject","properties":{"results":{"dataType":"array","array":{"dataType":"refAlias","ref":"SearchResult"},"required":true},"total":{"dataType":"double"}},"additionalProperties":false},
    "ReviewResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true},"reviewerId":{"dataType":"string","required":true},"rating":{"dataType":"double","required":true},"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"reviewer":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "Pick_ReviewInsert.Exclude_keyofReviewInsert.reviewer_id-or-user_id-or-created_at-or-id__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"rating":{"dataType":"double","required":true}},"validators":{}}},
    "CreateReviewDto": {"dataType":"refObject","properties":{"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"rating":{"dataType":"double","required":true}},"additionalProperties":false},
    "UpdateReviewDto": {"dataType":"refObject","properties":{"rating":{"dataType":"double"},"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]}},"additionalProperties":false},
    "PostResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["note"]},{"dataType":"enum","enums":["request"]},{"dataType":"enum","enums":["story"]}],"required":true},"title":{"dataType":"string","required":true},"description":{"dataType":"string","required":true},"authorId":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"paidOpportunity":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"expiresAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"metadata":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["genre"]},{"dataType":"enum","enums":["artist"]}],"required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"media":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"displayOrder":{"dataType":"double","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["video"]}],"required":true},"thumbnailUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"url":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"taggedUsers":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"author":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "PostType": {"dataType":"refAlias","type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["note"]},{"dataType":"enum","enums":["request"]},{"dataType":"enum","enums":["story"]}],"validators":{}}},
    "MediaItemDto": {"dataType":"refObject","properties":{"url":{"dataType":"string","required":true},"thumbnailUrl":{"dataType":"string"},"type":{"dataType":"string","required":true}},"additionalProperties":false},
    "Pick_PostInsert.Exclude_keyofPostInsert.id-or-author_id-or-created_at-or-updated_at-or-search_vector__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string","required":true},"expires_at":{"dataType":"string"},"location":{"dataType":"string"},"paid_opportunity":{"dataType":"boolean"},"title":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["note"]},{"dataType":"enum","enums":["request"]},{"dataType":"enum","enums":["story"]}],"required":true}},"validators":{}}},
    "CreatePostBody": {"dataType":"refObject","properties":{"description":{"dataType":"string","required":true},"expires_at":{"dataType":"string"},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"paid_opportunity":{"dataType":"boolean"},"title":{"dataType":"string","required":true},"type":{"ref":"PostType","required":true},"paidOpportunity":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}]},"expiresAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"tags":{"dataType":"array","array":{"dataType":"string"}},"genres":{"dataType":"array","array":{"dataType":"string"}},"taggedUsers":{"dataType":"array","array":{"dataType":"string"}},"media":{"dataType":"array","array":{"dataType":"refObject","ref":"MediaItemDto"}}},"additionalProperties":false},
    "PaginatedResponse_PostResponse_": {"dataType":"refObject","properties":{"data":{"dataType":"array","array":{"dataType":"refObject","ref":"PostResponse"},"required":true},"pagination":{"dataType":"nestedObjectLiteral","nestedProperties":{"total":{"dataType":"double"},"hasMore":{"dataType":"boolean","required":true},"nextCursor":{"dataType":"string"}},"required":true}},"additionalProperties":false},
    "CommentResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"postId":{"dataType":"string","required":true},"authorId":{"dataType":"string","required":true},"content":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"author":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "NotificationResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"recipientId":{"dataType":"string","required":true},"actorId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"type":{"dataType":"string","required":true},"entityType":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"entityId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"title":{"dataType":"string","required":true},"body":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"actionUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"isRead":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"isArchived":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"readAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"sentViaWebsocket":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"actor":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "UpdateNotificationDto": {"dataType":"refObject","properties":{"isRead":{"dataType":"boolean","required":true}},"additionalProperties":false},
    "MetadataItem": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["genre"]},{"dataType":"enum","enums":["artist"]}],"required":true},"name":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true}},"additionalProperties":false},
    "MetadataResponse": {"dataType":"refObject","properties":{"tags":{"dataType":"array","array":{"dataType":"refObject","ref":"MetadataItem"},"required":true},"genres":{"dataType":"array","array":{"dataType":"refObject","ref":"MetadataItem"},"required":true},"artists":{"dataType":"array","array":{"dataType":"refObject","ref":"MetadataItem"},"required":true}},"additionalProperties":false},
    "MessageResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"conversationId":{"dataType":"string","required":true},"senderId":{"dataType":"string","required":true},"content":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"mediaIds":{"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"string"}},{"dataType":"enum","enums":[null]}]},"isEdited":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"editedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"isDeleted":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"deletedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"replyToMessageId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"sentViaWebsocket":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"sender":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"replyTo":{"dataType":"union","subSchemas":[{"ref":"MessageResponse"},{"dataType":"enum","enums":[null]}]},"readReceipts":{"dataType":"array","array":{"dataType":"refObject","ref":"MessageReadReceiptResponse"}},"media":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"type":{"dataType":"string","required":true},"thumbnailUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"url":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}}},"additionalProperties":false},
    "MessageReadReceiptResponse": {"dataType":"refObject","properties":{"messageId":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true},"readAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"user":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "PaginatedMessagesResponse": {"dataType":"refObject","properties":{"messages":{"dataType":"array","array":{"dataType":"refObject","ref":"MessageResponse"},"required":true},"hasMore":{"dataType":"boolean","required":true},"nextCursor":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true}},"additionalProperties":false},
    "SendMessageDto": {"dataType":"refObject","properties":{"conversation_id":{"dataType":"string","required":true},"content":{"dataType":"string","required":true},"media_ids":{"dataType":"array","array":{"dataType":"string"}},"reply_to_message_id":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]}},"additionalProperties":false},
    "EditMessageDto": {"dataType":"refObject","properties":{"content":{"dataType":"string","required":true}},"additionalProperties":false},
    "MarkMessagesReadDto": {"dataType":"refObject","properties":{"message_ids":{"dataType":"array","array":{"dataType":"string"},"required":true}},"additionalProperties":false},
    "FeedPostResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["note"]},{"dataType":"enum","enums":["request"]},{"dataType":"enum","enums":["story"]}],"required":true},"title":{"dataType":"string","required":true},"description":{"dataType":"string","required":true},"authorId":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"paidOpportunity":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"expiresAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"metadata":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["genre"]},{"dataType":"enum","enums":["artist"]}],"required":true},"name":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"media":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"displayOrder":{"dataType":"double","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["video"]}],"required":true},"thumbnailUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"url":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"taggedUsers":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"author":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"likesCount":{"dataType":"double"},"commentsCount":{"dataType":"double"},"bookmarksCount":{"dataType":"double"},"hasLiked":{"dataType":"boolean"},"hasBookmarked":{"dataType":"boolean"}},"additionalProperties":false},
    "ConversationParticipantResponse": {"dataType":"refObject","properties":{"userId":{"dataType":"string","required":true},"conversationId":{"dataType":"string","required":true},"joinedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"leftAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"isAdmin":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"lastReadMessageId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastReadAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"notificationsEnabled":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"isMuted":{"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},"user":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "ConversationResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["direct"]},{"dataType":"enum","enums":["group"]}],"required":true},"name":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"createdBy":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"lastMessageId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastMessagePreview":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastMessageAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastMessageSenderId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"unreadCount":{"dataType":"double","required":true},"creator":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"participants":{"dataType":"array","array":{"dataType":"refObject","ref":"ConversationParticipantResponse"}}},"additionalProperties":false},
    "ConversationType": {"dataType":"refAlias","type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["direct"]},{"dataType":"enum","enums":["group"]}],"validators":{}}},
    "CreateConversationDto": {"dataType":"refObject","properties":{"type":{"ref":"ConversationType","required":true},"name":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"participantIds":{"dataType":"array","array":{"dataType":"string"},"required":true}},"additionalProperties":false},
    "UpdateConversationDto": {"dataType":"refObject","properties":{"name":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]}},"additionalProperties":false},
    "ConnectionStatus": {"dataType":"refAlias","type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["accepted"]},{"dataType":"enum","enums":["rejected"]}],"validators":{}}},
    "Connection": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"requesterId":{"dataType":"string","required":true},"recipientId":{"dataType":"string","required":true},"status":{"ref":"ConnectionStatus","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"updatedAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"requester":{"ref":"UserProfile"},"recipient":{"ref":"UserProfile"}},"additionalProperties":false},
    "Pick_ConnectionRequestInsert.Exclude_keyofConnectionRequestInsert.requester_id-or-created_at-or-updated_at-or-id-or-status__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"recipient_id":{"dataType":"string","required":true}},"validators":{}}},
    "CreateConnectionRequestDto": {"dataType":"refObject","properties":{"recipient_id":{"dataType":"string","required":true},"recipientId":{"dataType":"string","required":true}},"additionalProperties":false},
    "UpdateConnectionRequestDto": {"dataType":"refObject","properties":{"status":{"ref":"ConnectionStatus","required":true}},"additionalProperties":false},
    "Pick_CommentInsert.Exclude_keyofCommentInsert.author_id-or-created_at-or-updated_at-or-id__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"post_id":{"dataType":"string","required":true},"content":{"dataType":"string","required":true}},"validators":{}}},
    "CreateCommentDto": {"dataType":"refObject","properties":{"post_id":{"dataType":"string","required":true},"content":{"dataType":"string","required":true},"postId":{"dataType":"string","required":true}},"additionalProperties":false},
    "UpdateCommentDto": {"dataType":"refObject","properties":{"content":{"dataType":"string","required":true}},"additionalProperties":false},
    "CollaborationResponse": {"dataType":"refObject","properties":{"id":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true},"collaboratorId":{"dataType":"string","required":true},"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"collaborator":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"lastName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"firstName":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "Pick_CollaborationInsert.Exclude_keyofCollaborationInsert.user_id-or-created_at-or-id__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"collaborator_id":{"dataType":"string","required":true}},"validators":{}}},
    "CreateCollaborationDto": {"dataType":"refObject","properties":{"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"collaborator_id":{"dataType":"string","required":true},"collaboratorId":{"dataType":"string","required":true}},"additionalProperties":false},
    "BookmarkResponse": {"dataType":"refObject","properties":{"postId":{"dataType":"string","required":true},"userId":{"dataType":"string","required":true},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"post":{"dataType":"nestedObjectLiteral","nestedProperties":{"author":{"dataType":"nestedObjectLiteral","nestedProperties":{"avatarUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"lastName":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"username":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"createdAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"location":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},"type":{"dataType":"string","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},"additionalProperties":false},
    "Pick_BookmarkInsert.Exclude_keyofBookmarkInsert.user_id-or-created_at__": {"dataType":"refAlias","type":{"dataType":"nestedObjectLiteral","nestedProperties":{"post_id":{"dataType":"string","required":true}},"validators":{}}},
    "CreateBookmarkDto": {"dataType":"refObject","properties":{"post_id":{"dataType":"string","required":true},"postId":{"dataType":"string","required":true}},"additionalProperties":false},
};

const templateService = new ExpressTemplateService(models, {
    noImplicitAdditionalProperties: 'throw-on-extras',
});

export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################

        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_getUserMetadata: Record<string, TsoaRoute.ParameterSchema> = {
                type: {"in":"query","name":"type","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/users/metadata',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.getUserMetadata)),

            async function UsersController_getUserMetadata(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_getUserMetadata, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'getUserMetadata',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_getUser: Record<string, TsoaRoute.ParameterSchema> = {
                username: {"in":"path","name":"username","required":true,"dataType":"string"},
                Authorization: {"in":"header","name":"Authorization","dataType":"string"},
        };
        app.get('/users/:username',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.getUser)),

            async function UsersController_getUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_getUser, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'getUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUsersController_updateProfile: Record<string, TsoaRoute.ParameterSchema> = {
                username: {"in":"path","name":"username","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateProfileDto"},
                Authorization: {"in":"header","name":"Authorization","dataType":"string"},
        };
        app.put('/users/:username',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.updateProfile)),

            async function UsersController_updateProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_updateProfile, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'updateProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUploadController_generateSignedUploadUrl: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"SignedUrlRequestDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/upload/signed-url',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(UploadController)),
            ...(fetchMiddlewares<RequestHandler>(UploadController.prototype.generateSignedUploadUrl)),

            async function UploadController_generateSignedUploadUrl(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUploadController_generateSignedUploadUrl, request, response });

                const controller = new UploadController();

              await templateService.apiHandler({
                methodName: 'generateSignedUploadUrl',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMediaController_deleteMedia: Record<string, TsoaRoute.ParameterSchema> = {
                mediaId: {"in":"path","name":"mediaId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/media/:mediaId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MediaController)),
            ...(fetchMiddlewares<RequestHandler>(MediaController.prototype.deleteMedia)),

            async function MediaController_deleteMedia(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMediaController_deleteMedia, request, response });

                const controller = new MediaController();

              await templateService.apiHandler({
                methodName: 'deleteMedia',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSearchController_search: Record<string, TsoaRoute.ParameterSchema> = {
                q: {"in":"query","name":"q","dataType":"string"},
                tab: {"in":"query","name":"tab","dataType":"union","subSchemas":[{"dataType":"enum","enums":["for_you"]},{"dataType":"enum","enums":["people"]},{"dataType":"enum","enums":["collaborations"]},{"dataType":"enum","enums":["tags"]}]},
                location: {"in":"query","name":"location","dataType":"string"},
                genres: {"in":"query","name":"genres","dataType":"array","array":{"dataType":"string"}},
                lookingFor: {"in":"query","name":"lookingFor","dataType":"array","array":{"dataType":"string"}},
                paidOnly: {"in":"query","name":"paidOnly","dataType":"boolean"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                offset: {"in":"query","name":"offset","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/search',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.search)),

            async function SearchController_search(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_search, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'search',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsReviewsController_getUserReviews: Record<string, TsoaRoute.ParameterSchema> = {
                username: {"in":"path","name":"username","required":true,"dataType":"string"},
        };
        app.get('/users/:username/reviews',
            ...(fetchMiddlewares<RequestHandler>(ReviewsController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsController.prototype.getUserReviews)),

            async function ReviewsController_getUserReviews(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsController_getUserReviews, request, response });

                const controller = new ReviewsController();

              await templateService.apiHandler({
                methodName: 'getUserReviews',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsReviewsController_createReview: Record<string, TsoaRoute.ParameterSchema> = {
                username: {"in":"path","name":"username","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CreateReviewDto"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.post('/users/:username/reviews',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ReviewsController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsController.prototype.createReview)),

            async function ReviewsController_createReview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsController_createReview, request, response });

                const controller = new ReviewsController();

              await templateService.apiHandler({
                methodName: 'createReview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsReviewsByIdController_getReview: Record<string, TsoaRoute.ParameterSchema> = {
                reviewId: {"in":"path","name":"reviewId","required":true,"dataType":"string"},
        };
        app.get('/reviews/:reviewId',
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController.prototype.getReview)),

            async function ReviewsByIdController_getReview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsByIdController_getReview, request, response });

                const controller = new ReviewsByIdController();

              await templateService.apiHandler({
                methodName: 'getReview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsReviewsByIdController_updateReview: Record<string, TsoaRoute.ParameterSchema> = {
                reviewId: {"in":"path","name":"reviewId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateReviewDto"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.patch('/reviews/:reviewId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController.prototype.updateReview)),

            async function ReviewsByIdController_updateReview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsByIdController_updateReview, request, response });

                const controller = new ReviewsByIdController();

              await templateService.apiHandler({
                methodName: 'updateReview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsReviewsByIdController_deleteReview: Record<string, TsoaRoute.ParameterSchema> = {
                reviewId: {"in":"path","name":"reviewId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.delete('/reviews/:reviewId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsByIdController.prototype.deleteReview)),

            async function ReviewsByIdController_deleteReview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsByIdController_deleteReview, request, response });

                const controller = new ReviewsByIdController();

              await templateService.apiHandler({
                methodName: 'deleteReview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostsController_createPost: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreatePostBody"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/posts',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(PostsController)),
            ...(fetchMiddlewares<RequestHandler>(PostsController.prototype.createPost)),

            async function PostsController_createPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostsController_createPost, request, response });

                const controller = new PostsController();

              await templateService.apiHandler({
                methodName: 'createPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostsController_listPosts: Record<string, TsoaRoute.ParameterSchema> = {
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["note"]},{"dataType":"enum","enums":["request"]},{"dataType":"enum","enums":["story"]}]},
                authorId: {"in":"query","name":"authorId","dataType":"string"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                includeEngagement: {"in":"query","name":"includeEngagement","dataType":"boolean"},
                includeMedia: {"in":"query","name":"includeMedia","dataType":"boolean"},
                genreIds: {"in":"query","name":"genreIds","dataType":"array","array":{"dataType":"string"}},
                tags: {"in":"query","name":"tags","dataType":"array","array":{"dataType":"string"}},
                location: {"in":"query","name":"location","dataType":"string"},
                paidOnly: {"in":"query","name":"paidOnly","dataType":"boolean"},
                req: {"in":"request","name":"req","dataType":"object"},
        };
        app.get('/posts',
            ...(fetchMiddlewares<RequestHandler>(PostsController)),
            ...(fetchMiddlewares<RequestHandler>(PostsController.prototype.listPosts)),

            async function PostsController_listPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostsController_listPosts, request, response });

                const controller = new PostsController();

              await templateService.apiHandler({
                methodName: 'listPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostsController_getPost: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                includeComments: {"in":"query","name":"includeComments","dataType":"boolean"},
                commentsLimit: {"in":"query","name":"commentsLimit","dataType":"double"},
                req: {"in":"request","name":"req","dataType":"object"},
        };
        app.get('/posts/:id',
            ...(fetchMiddlewares<RequestHandler>(PostsController)),
            ...(fetchMiddlewares<RequestHandler>(PostsController.prototype.getPost)),

            async function PostsController_getPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostsController_getPost, request, response });

                const controller = new PostsController();

              await templateService.apiHandler({
                methodName: 'getPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationsController_getNotifications: Record<string, TsoaRoute.ParameterSchema> = {
                type: {"in":"query","name":"type","dataType":"string"},
                unreadOnly: {"in":"query","name":"unreadOnly","dataType":"boolean"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/notifications',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController.prototype.getNotifications)),

            async function NotificationsController_getNotifications(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationsController_getNotifications, request, response });

                const controller = new NotificationsController();

              await templateService.apiHandler({
                methodName: 'getNotifications',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationsController_getNotification: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/notifications/:notificationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController.prototype.getNotification)),

            async function NotificationsController_getNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationsController_getNotification, request, response });

                const controller = new NotificationsController();

              await templateService.apiHandler({
                methodName: 'getNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationsController_updateNotification: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateNotificationDto"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.patch('/notifications/:notificationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController.prototype.updateNotification)),

            async function NotificationsController_updateNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationsController_updateNotification, request, response });

                const controller = new NotificationsController();

              await templateService.apiHandler({
                methodName: 'updateNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationsController_deleteNotification: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.delete('/notifications/:notificationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController.prototype.deleteNotification)),

            async function NotificationsController_deleteNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationsController_deleteNotification, request, response });

                const controller = new NotificationsController();

              await templateService.apiHandler({
                methodName: 'deleteNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMetadataController_getMetadata: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/metadata',
            ...(fetchMiddlewares<RequestHandler>(MetadataController)),
            ...(fetchMiddlewares<RequestHandler>(MetadataController.prototype.getMetadata)),

            async function MetadataController_getMetadata(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMetadataController_getMetadata, request, response });

                const controller = new MetadataController();

              await templateService.apiHandler({
                methodName: 'getMetadata',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_getMessages: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                before_message_id: {"in":"query","name":"before_message_id","dataType":"string"},
        };
        app.get('/messages/:conversationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.getMessages)),

            async function MessagesController_getMessages(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_getMessages, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'getMessages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_sendMessage: Record<string, TsoaRoute.ParameterSchema> = {
                dto: {"in":"body","name":"dto","required":true,"ref":"SendMessageDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/messages',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.sendMessage)),

            async function MessagesController_sendMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_sendMessage, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'sendMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_editMessage: Record<string, TsoaRoute.ParameterSchema> = {
                messageId: {"in":"path","name":"messageId","required":true,"dataType":"string"},
                dto: {"in":"body","name":"dto","required":true,"ref":"EditMessageDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/messages/:messageId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.editMessage)),

            async function MessagesController_editMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_editMessage, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'editMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_deleteMessage: Record<string, TsoaRoute.ParameterSchema> = {
                messageId: {"in":"path","name":"messageId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/messages/:messageId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.deleteMessage)),

            async function MessagesController_deleteMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_deleteMessage, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'deleteMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_markAsRead: Record<string, TsoaRoute.ParameterSchema> = {
                dto: {"in":"body","name":"dto","required":true,"ref":"MarkMessagesReadDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/messages/read',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.markAsRead)),

            async function MessagesController_markAsRead(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_markAsRead, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'markAsRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessagesController_setTyping: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"string"},
                isTyping: {"default":true,"in":"query","name":"isTyping","dataType":"boolean"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/messages/typing/:conversationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.setTyping)),

            async function MessagesController_setTyping(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_setTyping, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'setTyping',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedController_getFeed: Record<string, TsoaRoute.ParameterSchema> = {
                component: {"in":"query","name":"component","dataType":"union","subSchemas":[{"dataType":"enum","enums":["posts"]},{"dataType":"enum","enums":["recommendations"]},{"dataType":"enum","enums":["stories"]}]},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.get('/feed',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(FeedController)),
            ...(fetchMiddlewares<RequestHandler>(FeedController.prototype.getFeed)),

            async function FeedController_getFeed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedController_getFeed, request, response });

                const controller = new FeedController();

              await templateService.apiHandler({
                methodName: 'getFeed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_getConversations: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/conversations',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.getConversations)),

            async function ConversationsController_getConversations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_getConversations, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'getConversations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_getUnreadCount: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/conversations/unread-count',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.getUnreadCount)),

            async function ConversationsController_getUnreadCount(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_getUnreadCount, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'getUnreadCount',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_getConversation: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/conversations/:conversationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.getConversation)),

            async function ConversationsController_getConversation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_getConversation, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'getConversation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_createConversation: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateConversationDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/conversations',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.createConversation)),

            async function ConversationsController_createConversation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_createConversation, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'createConversation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_updateConversation: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateConversationDto"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/conversations/:conversationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.updateConversation)),

            async function ConversationsController_updateConversation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_updateConversation, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'updateConversation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationsController_deleteConversation: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/conversations/:conversationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.deleteConversation)),

            async function ConversationsController_deleteConversation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_deleteConversation, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'deleteConversation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_getConnectionRequests: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/connections',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.getConnectionRequests)),

            async function ConnectionsController_getConnectionRequests(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_getConnectionRequests, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'getConnectionRequests',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_getSentConnectionRequests: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/connections/sent/:userId',
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.getSentConnectionRequests)),

            async function ConnectionsController_getSentConnectionRequests(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_getSentConnectionRequests, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'getSentConnectionRequests',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_getReceivedConnectionRequests: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/connections/received/:userId',
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.getReceivedConnectionRequests)),

            async function ConnectionsController_getReceivedConnectionRequests(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_getReceivedConnectionRequests, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'getReceivedConnectionRequests',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_createConnectionRequest: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateConnectionRequestDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/connections',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.createConnectionRequest)),

            async function ConnectionsController_createConnectionRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_createConnectionRequest, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'createConnectionRequest',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_updateConnectionRequest: Record<string, TsoaRoute.ParameterSchema> = {
                requestId: {"in":"path","name":"requestId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateConnectionRequestDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/connections/:requestId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.updateConnectionRequest)),

            async function ConnectionsController_updateConnectionRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_updateConnectionRequest, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'updateConnectionRequest',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConnectionsController_deleteConnectionRequest: Record<string, TsoaRoute.ParameterSchema> = {
                requestId: {"in":"path","name":"requestId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/connections/:requestId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.deleteConnectionRequest)),

            async function ConnectionsController_deleteConnectionRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_deleteConnectionRequest, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'deleteConnectionRequest',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommentsController_getPostComments: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"string"},
        };
        app.get('/comments/post/:postId',
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.getPostComments)),

            async function CommentsController_getPostComments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_getPostComments, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'getPostComments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommentsController_getUserComments: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/comments/user/:userId',
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.getUserComments)),

            async function CommentsController_getUserComments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_getUserComments, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'getUserComments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommentsController_createComment: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateCommentDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/comments',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.createComment)),

            async function CommentsController_createComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_createComment, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'createComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommentsController_updateComment: Record<string, TsoaRoute.ParameterSchema> = {
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateCommentDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/comments/:commentId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.updateComment)),

            async function CommentsController_updateComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_updateComment, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'updateComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommentsController_deleteComment: Record<string, TsoaRoute.ParameterSchema> = {
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/comments/:commentId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.deleteComment)),

            async function CommentsController_deleteComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_deleteComment, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'deleteComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCollaborationsController_getCollaborations: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/collaborations',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController)),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController.prototype.getCollaborations)),

            async function CollaborationsController_getCollaborations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCollaborationsController_getCollaborations, request, response });

                const controller = new CollaborationsController();

              await templateService.apiHandler({
                methodName: 'getCollaborations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCollaborationsController_getUserCollaborations: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/collaborations/:userId',
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController)),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController.prototype.getUserCollaborations)),

            async function CollaborationsController_getUserCollaborations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCollaborationsController_getUserCollaborations, request, response });

                const controller = new CollaborationsController();

              await templateService.apiHandler({
                methodName: 'getUserCollaborations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCollaborationsController_createCollaboration: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateCollaborationDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/collaborations',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController)),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController.prototype.createCollaboration)),

            async function CollaborationsController_createCollaboration(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCollaborationsController_createCollaboration, request, response });

                const controller = new CollaborationsController();

              await templateService.apiHandler({
                methodName: 'createCollaboration',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCollaborationsController_deleteCollaboration: Record<string, TsoaRoute.ParameterSchema> = {
                collaborationId: {"in":"path","name":"collaborationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/collaborations/:collaborationId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController)),
            ...(fetchMiddlewares<RequestHandler>(CollaborationsController.prototype.deleteCollaboration)),

            async function CollaborationsController_deleteCollaboration(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCollaborationsController_deleteCollaboration, request, response });

                const controller = new CollaborationsController();

              await templateService.apiHandler({
                methodName: 'deleteCollaboration',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBookmarksController_getBookmarks: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/bookmarks',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController)),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController.prototype.getBookmarks)),

            async function BookmarksController_getBookmarks(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBookmarksController_getBookmarks, request, response });

                const controller = new BookmarksController();

              await templateService.apiHandler({
                methodName: 'getBookmarks',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBookmarksController_createBookmark: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateBookmarkDto"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.post('/bookmarks',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController)),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController.prototype.createBookmark)),

            async function BookmarksController_createBookmark(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBookmarksController_createBookmark, request, response });

                const controller = new BookmarksController();

              await templateService.apiHandler({
                methodName: 'createBookmark',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBookmarksController_deleteBookmark: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/bookmarks/:postId',
            authenticateMiddleware([[{"bearerAuth":[]}]]),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController)),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController.prototype.deleteBookmark)),

            async function BookmarksController_deleteBookmark(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBookmarksController_deleteBookmark, request, response });

                const controller = new BookmarksController();

              await templateService.apiHandler({
                methodName: 'deleteBookmark',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_checkUsername: Record<string, TsoaRoute.ParameterSchema> = {
                username: {"in":"query","name":"username","required":true,"dataType":"string"},
        };
        app.get('/auth/check-username',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.checkUsername)),

            async function AuthController_checkUsername(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_checkUsername, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'checkUsername',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
}


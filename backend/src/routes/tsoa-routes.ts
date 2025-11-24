/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UsersController } from './../controllers/users.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UploadsController } from './../controllers/upload.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SearchController } from './../controllers/search.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ReviewsController } from './../controllers/reviews.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PostsController } from './../controllers/posts.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationsController } from './../controllers/notifications.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MetadataController } from './../controllers/metadata.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MessagesController } from './../controllers/messages.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConversationsController } from './../controllers/conversations.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConnectionsController } from './../controllers/connections.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CommentsController } from './../controllers/comments.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CollaborationsController } from './../controllers/collaborations.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BookmarksController } from './../controllers/bookmarks.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUsersController_getAllUsers: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/users',
            ...(fetchMiddlewares<RequestHandler>(UsersController)),
            ...(fetchMiddlewares<RequestHandler>(UsersController.prototype.getAllUsers)),

            async function UsersController_getAllUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUsersController_getAllUsers, request, response });

                const controller = new UsersController();

              await templateService.apiHandler({
                methodName: 'getAllUsers',
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
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/users/:userId',
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
        const argsUploadsController_getUploads: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/uploads',
            ...(fetchMiddlewares<RequestHandler>(UploadsController)),
            ...(fetchMiddlewares<RequestHandler>(UploadsController.prototype.getUploads)),

            async function UploadsController_getUploads(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUploadsController_getUploads, request, response });

                const controller = new UploadsController();

              await templateService.apiHandler({
                methodName: 'getUploads',
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
        const argsUploadsController_getUserUploads: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/uploads/:userId',
            ...(fetchMiddlewares<RequestHandler>(UploadsController)),
            ...(fetchMiddlewares<RequestHandler>(UploadsController.prototype.getUserUploads)),

            async function UploadsController_getUserUploads(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUploadsController_getUserUploads, request, response });

                const controller = new UploadsController();

              await templateService.apiHandler({
                methodName: 'getUserUploads',
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
        const argsSearchController_getRecentSearchResults: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/search',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.getRecentSearchResults)),

            async function SearchController_getRecentSearchResults(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_getRecentSearchResults, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'getRecentSearchResults',
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
        const argsSearchController_getUserRecentSearches: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/search/:userId',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.getUserRecentSearches)),

            async function SearchController_getUserRecentSearches(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_getUserRecentSearches, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'getUserRecentSearches',
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
        const argsReviewsController_getReviews: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/reviews',
            ...(fetchMiddlewares<RequestHandler>(ReviewsController)),
            ...(fetchMiddlewares<RequestHandler>(ReviewsController.prototype.getReviews)),

            async function ReviewsController_getReviews(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsReviewsController_getReviews, request, response });

                const controller = new ReviewsController();

              await templateService.apiHandler({
                methodName: 'getReviews',
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
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/reviews/:userId',
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
        const argsPostsController_getPosts: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/posts',
            ...(fetchMiddlewares<RequestHandler>(PostsController)),
            ...(fetchMiddlewares<RequestHandler>(PostsController.prototype.getPosts)),

            async function PostsController_getPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostsController_getPosts, request, response });

                const controller = new PostsController();

              await templateService.apiHandler({
                methodName: 'getPosts',
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
        const argsPostsController_getUserPosts: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/posts/:userId',
            ...(fetchMiddlewares<RequestHandler>(PostsController)),
            ...(fetchMiddlewares<RequestHandler>(PostsController.prototype.getUserPosts)),

            async function PostsController_getUserPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostsController_getUserPosts, request, response });

                const controller = new PostsController();

              await templateService.apiHandler({
                methodName: 'getUserPosts',
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
        };
        app.get('/notifications',
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
        const argsNotificationsController_getUserNotifications: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/notifications/:userId',
            ...(fetchMiddlewares<RequestHandler>(NotificationsController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationsController.prototype.getUserNotifications)),

            async function NotificationsController_getUserNotifications(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationsController_getUserNotifications, request, response });

                const controller = new NotificationsController();

              await templateService.apiHandler({
                methodName: 'getUserNotifications',
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
        const argsMetadataController_getUserMetadata: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/metadata/:userId',
            ...(fetchMiddlewares<RequestHandler>(MetadataController)),
            ...(fetchMiddlewares<RequestHandler>(MetadataController.prototype.getUserMetadata)),

            async function MetadataController_getUserMetadata(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMetadataController_getUserMetadata, request, response });

                const controller = new MetadataController();

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
        const argsMessagesController_getMessages: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/messages',
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
        const argsMessagesController_getUserMessages: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/messages/:userId',
            ...(fetchMiddlewares<RequestHandler>(MessagesController)),
            ...(fetchMiddlewares<RequestHandler>(MessagesController.prototype.getUserMessages)),

            async function MessagesController_getUserMessages(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessagesController_getUserMessages, request, response });

                const controller = new MessagesController();

              await templateService.apiHandler({
                methodName: 'getUserMessages',
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
        };
        app.get('/conversations',
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
        const argsConversationsController_getUserConversations: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/conversations/:userId',
            ...(fetchMiddlewares<RequestHandler>(ConversationsController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationsController.prototype.getUserConversations)),

            async function ConversationsController_getUserConversations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationsController_getUserConversations, request, response });

                const controller = new ConversationsController();

              await templateService.apiHandler({
                methodName: 'getUserConversations',
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
        };
        app.get('/connections',
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
        const argsConnectionsController_getUserConnectionsRequest: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/connections/:userId',
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController)),
            ...(fetchMiddlewares<RequestHandler>(ConnectionsController.prototype.getUserConnectionsRequest)),

            async function ConnectionsController_getUserConnectionsRequest(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConnectionsController_getUserConnectionsRequest, request, response });

                const controller = new ConnectionsController();

              await templateService.apiHandler({
                methodName: 'getUserConnectionsRequest',
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
        const argsCommentsController_getComments: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/comments',
            ...(fetchMiddlewares<RequestHandler>(CommentsController)),
            ...(fetchMiddlewares<RequestHandler>(CommentsController.prototype.getComments)),

            async function CommentsController_getComments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommentsController_getComments, request, response });

                const controller = new CommentsController();

              await templateService.apiHandler({
                methodName: 'getComments',
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
        app.get('/comments/:userId',
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
        const argsCollaborationsController_getCollaborations: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/collaborations',
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
        const argsBookmarksController_getBookmarks: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/bookmarks',
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
        const argsBookmarksController_getUserBookmarks: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/bookmarks/:userId',
            ...(fetchMiddlewares<RequestHandler>(BookmarksController)),
            ...(fetchMiddlewares<RequestHandler>(BookmarksController.prototype.getUserBookmarks)),

            async function BookmarksController_getUserBookmarks(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsBookmarksController_getUserBookmarks, request, response });

                const controller = new BookmarksController();

              await templateService.apiHandler({
                methodName: 'getUserBookmarks',
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

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

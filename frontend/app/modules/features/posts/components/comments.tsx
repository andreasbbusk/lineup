import { Avatar } from "@/app/modules/components/avatar";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostComments, createComment, likeComment, unlikeComment } from "@/app/modules/api/commentsApi";
import type { CommentResponse as ApiCommentResponse } from "@/app/modules/api/commentsApi";

// Extended type to include nested replies
type CommentResponseWithReplies = ApiCommentResponse & {
	parentId?: string | null;
	replies?: CommentResponseWithReplies[];
};

const MAX_COMMENT_DEPTH = 3;

interface CommentsProps {
	postId: string;
}

function Comments({ postId }: CommentsProps) {
	const queryClient = useQueryClient();
	const { data: comments = [], isLoading } = useQuery<
		CommentResponseWithReplies[]
	>({
		queryKey: ["comments", "post", postId],
		queryFn: () =>
			getPostComments(postId) as Promise<CommentResponseWithReplies[]>,
		enabled: !!postId,
	});
	const createCommentMutation = useMutation({
		mutationFn: (data: {
			postId: string;
			content: string;
			parentId?: string | null;
		}) => createComment(data),
		onSuccess: (newComment) => {
			// Refetch comments for this post
			queryClient.refetchQueries({
				queryKey: ["comments", "post", newComment.postId],
			});
			// Refetch the specific post (to update comment count)
			queryClient.refetchQueries({ queryKey: ["posts", newComment.postId] });
			// Refetch all posts lists (to update comment counts in feeds)
			queryClient.refetchQueries({ queryKey: ["posts"], exact: false });
		},
	});
	const [commentText, setCommentText] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim()) return;

		try {
			await createCommentMutation.mutateAsync({
				postId,
				content: commentText.trim(),
			});
			setCommentText("");
		} catch (error) {
			console.error("Failed to create comment:", error);
		}
	};

	return (
		<div className="px-2.5 mt-[0.625rem] flex flex-col items-start gap-[1.875rem] self-stretch">
			<form
				onSubmit={handleSubmit}
				className="flex p-[0.625rem] justify-between items-start self-stretch border border-black/20 rounded-[0.5rem]">
				<input
					placeholder="Leave a comment"
					className="flex-1 outline-none"
					type="text"
					value={commentText}
					onChange={(e) => setCommentText(e.target.value)}
				/>

				<button
					type="submit"
					className="flex w-[1.5rem] h-[1.5rem] justify-center items-center gap-[0.625rem] aspect-square rounded-[0.5rem] bg-[#FFCF70]">
					<Image
						src="/icons/arrow-right.svg"
						alt="Send"
						width={24}
						height={24}
						className="-rotate-90"
					/>
				</button>
			</form>
			{isLoading ? (
				<p className="text-[#555] text-[0.875rem]">Loading comments...</p>
			) : comments.length === 0 ? (
				<p className="text-[#555] text-[0.875rem]">
					No comments yet. Be the first to comment!
				</p>
			) : (
				comments.map((comment) => {
					// Recursively map comment and all nested replies
					const mapComment = (c: CommentResponseWithReplies): Comment => ({
						id: c.id,
						description: c.content,
						parentId: c.parentId ?? undefined,
						replies: c.replies?.map(mapComment),
						author: c.author
							? {
									username: c.author.username,
									firstName: c.author.firstName ?? undefined,
									avatarUrl: c.author.avatarUrl ?? undefined,
							  }
							: undefined,
						likesCount: c.likesCount,
						isLiked: c.isLiked,
					});

					return (
						<CommentItem
							key={comment.id}
							comment={mapComment(comment)}
							depth={1}
							postId={postId}
						/>
					);
				})
			)}
		</div>
	);
}

type Comment = {
	id: string;
	description: string;
	parentId?: string | null;
	replies?: Comment[];
	author?: {
		username?: string;
		firstName?: string;
		avatarUrl?: string;
	};
	likesCount?: number;
	isLiked?: boolean;
	// Add other fields as needed
};

function CommentItem({
	comment,
	depth,
	postId,
}: {
	comment: Comment;
	depth: number;
	postId: string;
}) {
	const queryClient = useQueryClient();
	const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
	const [likesCount, setLikesCount] = useState(comment.likesCount ?? 0);
	const [showReplies, setShowReplies] = useState(true);
	const [showReplyInput, setShowReplyInput] = useState(false);
	const [replyText, setReplyText] = useState("");

	// Update state when comment prop changes
	useEffect(() => {
		setIsLiked(comment.isLiked ?? false);
		setLikesCount(comment.likesCount ?? 0);
	}, [comment.isLiked, comment.likesCount]);

	const createCommentMutation = useMutation({
		mutationFn: (data: {
			postId: string;
			content: string;
			parentId?: string | null;
		}) => createComment(data),
		onSuccess: (newComment) => {
			// Refetch comments for this post
			queryClient.refetchQueries({
				queryKey: ["comments", "post", newComment.postId],
			});
			// Refetch the specific post (to update comment count)
			queryClient.refetchQueries({ queryKey: ["posts", newComment.postId] });
			// Refetch all posts lists (to update comment counts in feeds)
			queryClient.refetchQueries({ queryKey: ["posts"], exact: false });
		},
	});

	const likeCommentMutation = useMutation({
		mutationFn: (liked: boolean) =>
			liked ? likeComment(comment.id) : unlikeComment(comment.id),
		onMutate: (liked: boolean) => {
			// Optimistic update
			setIsLiked(liked);
			setLikesCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
		},
		onError: (error) => {
			// Revert on error
			setIsLiked(!isLiked);
			setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
			console.error("Failed to like/unlike comment:", error);
		},
		onSuccess: () => {
			// Refetch comments to get accurate counts
			queryClient.refetchQueries({
				queryKey: ["comments", "post", postId],
			});
		},
	});

	const handleLikeClick = () => {
		const newLikedState = !isLiked;
		likeCommentMutation.mutate(newLikedState);
	};

	const canHaveReplies = depth < MAX_COMMENT_DEPTH;
	const isAtMaxDepth = depth === MAX_COMMENT_DEPTH;

	const handleReplySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyText.trim()) return;

		try {
			// At max depth, create as sibling (use parent's parentId), otherwise create as child
			const parentId = isAtMaxDepth ? comment.parentId : comment.id;
			await createCommentMutation.mutateAsync({
				postId,
				content: replyText.trim(),
				parentId: parentId || null,
			});
			setReplyText("");
			setShowReplyInput(false);
		} catch (error) {
			console.error("Failed to create reply:", error);
		}
	};

	const replies = comment.replies || [];
	const totalReplies = replies.length;

	return (
		<div className="w-full flex flex-col items-start gap-[0.325rem] self-stretch">
			<div className="flex items-center gap-[0.3125rem]">
				<Avatar
					size="xs"
					alt={comment.author?.username || "User avatar"}
					src={comment.author?.avatarUrl}
					fallback={(comment.author?.firstName ||
						comment.author?.username ||
						"U")[0].toUpperCase()}
				/>
				<p className="text-[#555] text-center font-sans text-[0.875rem] font-normal leading-[1.18125rem] tracking-[0.03125rem]">
					{comment.author?.firstName}
				</p>
			</div>
			<p>{comment.description}</p>
			<div className="flex  justify-end items-center gap-[0.9375rem] self-stretch">
				<div
					className="flex items-center gap-[0.3125rem] cursor-pointer"
					onClick={handleLikeClick}>
					{isLiked ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="19"
							height="17"
							viewBox="0 0 19 17"
							fill="none">
							<path
								d="M17.4167 5.63518C17.4167 6.92395 16.9219 8.16177 16.0381 9.07738C14.0041 11.1859 12.0312 13.3844 9.92111 15.4164C9.43741 15.8754 8.67013 15.8586 8.20733 15.3789L2.12813 9.07738C0.290623 7.17267 0.290623 4.09769 2.12813 2.19298C3.9837 0.269544 7.00662 0.269543 8.86218 2.19298L9.08314 2.42201L9.30397 2.1931C10.1937 1.27042 11.4054 0.75 12.6711 0.75C13.9368 0.75 15.1484 1.27037 16.0381 2.19298C16.9219 3.1087 17.4167 4.34647 17.4167 5.63518Z"
								fill="#FFCF70"
								stroke="#FFCF70"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="19"
							height="17"
							viewBox="0 0 19 17"
							fill="none">
							<path
								d="M17.4167 5.63518C17.4167 6.92395 16.9219 8.16177 16.0381 9.07738C14.0041 11.1859 12.0312 13.3844 9.92111 15.4164C9.43741 15.8754 8.67013 15.8586 8.20733 15.3789L2.12813 9.07738C0.290623 7.17267 0.290623 4.09769 2.12813 2.19298C3.9837 0.269544 7.00662 0.269543 8.86218 2.19298L9.08314 2.42201L9.30397 2.1931C10.1937 1.27042 11.4054 0.75 12.6711 0.75C13.9368 0.75 15.1484 1.27037 16.0381 2.19298C16.9219 3.1087 17.4167 4.34647 17.4167 5.63518Z"
								stroke="#555555"
								strokeWidth="1.5"
								strokeLinejoin="round"
							/>
						</svg>
					)}
					<p className="text-[#555] text-xs">{likesCount}</p>
				</div>
				<button
					onClick={() => setShowReplyInput(!showReplyInput)}
					className={`flex items-center gap-2 text-[#555] font-sans text-[0.875rem] font-medium leading-[1.18125rem] tracking-[0.03125rem] ${
						depth >= 2 ? "gap-0" : ""
					}`}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="14"
						viewBox="0 0 20 14"
						fill="none">
						<path
							d="M18.75 13.125V10.875C18.75 9.68153 18.2759 8.53693 17.432 7.69302C16.5881 6.84911 15.4435 6.375 14.25 6.375H0.75"
							stroke="#555555"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M6.375 12L0.75 6.375L6.375 0.75"
							stroke="#555555"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					{depth === 1 && <p>Reply</p>}
				</button>
			</div>

			{showReplyInput && (
				<form
					onSubmit={handleReplySubmit}
					className="flex p-[0.625rem] justify-between items-start self-stretch border border-black/20 rounded-[0.5rem] mt-[0.625rem]">
					<input
						placeholder="Write a reply..."
						className="flex-1 outline-none"
						type="text"
						value={replyText}
						onChange={(e) => setReplyText(e.target.value)}
						autoFocus
					/>
					<button
						type="submit"
						className="flex w-[1.5rem] h-[1.5rem] justify-center items-center gap-[0.625rem] aspect-square rounded-[0.5rem] bg-[#FFCF70]">
						<Image
							src="/icons/arrow-right.svg"
							alt="Send"
							width={24}
							height={24}
							className="-rotate-90"
						/>
					</button>
				</form>
			)}
			{depth < MAX_COMMENT_DEPTH && replies.length > 0 && showReplies && (
				<div className="flex flex-col gap-[0.625rem] items-start self-stretch border-l border-black/20 pl-[1.25rem] mt-[0.9375rem]">
					{replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							depth={depth + 1}
							postId={postId}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export { Comments };

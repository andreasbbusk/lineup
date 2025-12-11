import { Avatar } from "@/app/modules/components/avatar";
import { useState } from "react";
import Image from "next/image";
import { usePosts } from "@/app/modules/hooks";

const MAX_COMMENT_DEPTH = 3;

function Comments() {
	const { data } = usePosts({ limit: 3 });
	const comments = data?.data || [];
	const [commentText, setCommentText] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentText.trim()) return;

		console.log("Submitting comment:", commentText);
		// TODO: Post to database

		setCommentText("");
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
			{comments?.map((comment) => {
				const mappedComment: Comment = {
					id: comment.id,
					description: comment.description,
					author: comment.author
						? {
								username: comment.author.username,
								firstName: comment.author.firstName ?? undefined,
								avatarUrl: comment.author.avatarUrl ?? undefined,
						  }
						: undefined,
				};
				return (
					<CommentItem
						key={mappedComment.id}
						comment={mappedComment}
						depth={1}
					/>
				);
			})}
		</div>
	);
}

type Comment = {
	id: string;
	description: string;
	author?: {
		username?: string;
		firstName?: string;
		avatarUrl?: string;
	};
	// Add other fields as needed
};

function CommentItem({ comment, depth }: { comment: Comment; depth: number }) {
	const [isLiked, setIsLiked] = useState(false);
	const [showReplies, setShowReplies] = useState(true);
	const [showReplyInput, setShowReplyInput] = useState(false);
	const [replyText, setReplyText] = useState("");

	const { data } = usePosts({ limit: 3 });
	const replies = data?.data || [];

	const canHaveReplies = depth <= MAX_COMMENT_DEPTH;

	const handleReplySubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!replyText.trim()) return;

		if (depth === MAX_COMMENT_DEPTH) {
			console.log(`Adding comment at same level as ${comment.id}:`, replyText);
			// TODO: Post reply to database with same parent as current comment
		} else {
			console.log(`Replying to comment ${comment.id}:`, replyText);
			// TODO: Post reply to database with parent comment ID
		}

		setReplyText("");
		setShowReplyInput(false);
	};

	return (
		<div>
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
			<div className="flex h-[1.875rem] justify-end items-center gap-[0.9375rem] self-stretch">
				<div
					className="flex items-center gap-[0.3125rem]"
					onClick={() => setIsLiked(!isLiked)}>
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
					<p className="text-[#555] text-xs">10</p>
				</div>
				{canHaveReplies && (
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
				)}
			</div>

			{showReplyInput && canHaveReplies && (
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
					{replies.map((reply) => {
						const mappedReply: Comment = {
							id: reply.id,
							description: reply.description,
							author: reply.author
								? {
										username: reply.author.username,
										firstName: reply.author.firstName ?? undefined,
										avatarUrl: reply.author.avatarUrl ?? undefined,
								  }
								: undefined,
						};
						return (
							<CommentItem
								key={mappedReply.id}
								comment={mappedReply}
								depth={depth + 1}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
}

export { Comments };

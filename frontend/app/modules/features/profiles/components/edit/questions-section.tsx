import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Divider } from "./divider";

interface QuestionsSectionProps {
	showQuestionsSection: boolean;
	setShowQuestionsSection: (show: boolean) => void;
	allFaqQuestions: Array<{ id: string; question: string }> | undefined;
	faqData:
		| Array<{ questionId: string; question: string; answer: string }>
		| undefined;
	username: string | undefined;
	upsertFaq: (data: { questionId: string; answer: string }) => void;
	deleteFaq: (questionId: string) => void;
}

export function QuestionsSection({
	showQuestionsSection,
	setShowQuestionsSection,
	allFaqQuestions,
	faqData,
	username,
	upsertFaq,
	deleteFaq,
}: QuestionsSectionProps) {
	const [isEditingQuestions, setIsEditingQuestions] = useState(false);
	const [faqAnswers, setFaqAnswers] = useState<Record<string, string>>({});

	// Initialize FAQ answers when data loads
	const initialFaqAnswers = useMemo(() => {
		if (!faqData) return {};
		const answers: Record<string, string> = {};
		faqData.forEach((faq) => {
			answers[faq.questionId] = faq.answer;
		});
		return answers;
	}, [faqData]);

	useEffect(() => {
		setFaqAnswers(initialFaqAnswers);
	}, [initialFaqAnswers]);

	const handleFaqAnswerChange = (questionId: string, answer: string) => {
		setFaqAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}));
	};

	const handleSaveFaq = () => {
		if (!username) return;

		// Get all questions that were answered
		const answeredQuestions = Object.entries(faqAnswers).filter(
			([, answer]) => answer.trim() !== ""
		);

		// Upsert all answered questions
		answeredQuestions.forEach(([questionId, answer]) => {
			upsertFaq({ questionId, answer });
		});

		// Delete questions that were cleared (had answer before, now empty)
		faqData?.forEach((faq) => {
			if (
				!faqAnswers[faq.questionId] ||
				faqAnswers[faq.questionId].trim() === ""
			) {
				deleteFaq(faq.questionId);
			}
		});

		setIsEditingQuestions(false);
	};

	if (!showQuestionsSection) return null;

	return (
		<div className="relative flex flex-col self-stretch gap-[0.875rem] rounded-[1.5625rem] border border-black/10 py-9 px-[0.9375rem]">
			<Image
				src={"/icons/close.svg"}
				width={24}
				height={24}
				alt="Close"
				className="absolute top-2 right-2 cursor-pointer"
				onClick={() => setShowQuestionsSection(false)}
			/>

			<h4 className="w-full max-w-[6rem] font-semibold">Questions</h4>
			{isEditingQuestions ? (
				// Show all available questions when editing
				<div className="flex flex-col self-stretch gap-[0.625rem]">
					{allFaqQuestions?.map((question) => (
						<div key={question.id} className="px-[0.9375rem]">
							<h5 className="font-semibold">{question.question}</h5>
							<textarea
								value={faqAnswers[question.id] || ""}
								onChange={(e) =>
									handleFaqAnswerChange(question.id, e.target.value)
								}
								placeholder="Type your answer here..."
								className="w-full px-3 py-2 rounded-lg border border-black/10"
								rows={2}
							/>
						</div>
					))}
				</div>
			) : (
				// Show answered questions when not editing
				<ul className="flex flex-col gap-[0.625rem]">
					{faqData?.map((faq, index) => (
						<li
							key={index}
							className="flex flex-col items-start gap-[0.3125rem] pb-4 pl-[0.9375rem]">
							<h5 className="font-semibold">{faq.question}</h5>
							<p className="pl-[1.375rem]">{faq.answer}</p>
							<Divider long />
						</li>
					))}
				</ul>
			)}
			{!isEditingQuestions ? (
				<div className="flex self-center gap-[0.3125rem]">
					<Image
						src={"/icons/add-circle.svg"}
						width={16}
						height={16}
						alt="Add"
					/>
					<p
						onClick={() => setIsEditingQuestions(true)}
						className="cursor-pointer">
						Add question
					</p>
				</div>
			) : (
				<p onClick={handleSaveFaq} className="self-center cursor-pointer">
					Done
				</p>
			)}
		</div>
	);
}

"use client";

import { CreateForm } from "@/app/modules/features/posts/components/create-form";

export default function Page() {
	return (
		<main className="bg-white h-[calc(100dvh-64px)] max-w-200 mx-auto">
			<CreateForm />
		</main>
	);
}

"use client";

import { useAppStore } from "@/app/lib/stores/app-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const router = useRouter();
	const { isAuthenticated, user } = useAppStore();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}

		if (!user?.username) {
			router.push("/onboarding");
			return;
		}

		router.push(`/profile/${user.username}`);
	}, [isAuthenticated, user, router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			Loading...
		</div>
	);
}

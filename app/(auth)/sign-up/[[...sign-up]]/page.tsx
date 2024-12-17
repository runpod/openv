"use client";
import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import config from "@/config";

export default function SignUpPage() {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}

	return (
		<div className="flex min-w-screen justify-center my-[5rem]">
			<SignUp fallbackRedirectUrl="/" signInFallbackRedirectUrl="/my-videos" />
		</div>
	);
}

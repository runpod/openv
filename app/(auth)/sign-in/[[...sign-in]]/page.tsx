"use client";
import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import config from "@/config";

export default function SignInPage() {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}

	return (
		<div className="flex min-w-screen justify-center my-[5rem]">
			<SignIn fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/dashboard" />
		</div>
	);
}

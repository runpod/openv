"use client";

import { useAuth } from "@clerk/nextjs";

import { Logo } from "@/components/ui/logo";
import config from "@/config";

import ModeToggle from "../mode-toggle";
import { UserProfile } from "../user-profile";

export default function NavBar() {
	let userId = null;
	/* eslint-disable react-hooks/rules-of-hooks */
	if (config?.auth?.enabled) {
		const { userId: authUserId } = useAuth();
		userId = authUserId;
	}

	return (
		<div className="flex min-w-full fixed justify-between p-2 border-b z-10 dark:bg-black dark:bg-opacity-50 bg-white">
			<Logo />
			<div className="flex items-center gap-2">
				{userId && <UserProfile />}
				<ModeToggle />
			</div>
		</div>
	);
}

"use client";
import { UserProfile } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import config from "@/config";

const UserProfilePage = () => {
	const router = useRouter();

	if (!config?.auth?.enabled) {
		router.back();
	}
	return (
		<div className="h-full flex items-center justify-center p-9">
			{config?.auth?.enabled && <UserProfile path="/user-profile" routing="path" />}
		</div>
	);
};

export default UserProfilePage;

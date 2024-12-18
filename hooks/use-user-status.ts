import { useUser } from "@clerk/nextjs";
import { UserRole } from "@prisma/client";
import { useEffect, useState } from "react";

import type { UserStatus } from "@/lib/auth";

export function useUserStatus() {
	const { user } = useUser();
	const [status, setStatus] = useState<UserStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			if (!user) {
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/voucher");
				if (!response.ok) {
					throw new Error("Failed to fetch user status");
				}
				const data = await response.json();
				setStatus(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		};

		fetchStatus();
	}, [user]);

	const hasAccess = status?.role === UserRole.user;

	return {
		status,
		setStatus,
		isLoading,
		error,
		hasAccess,
	};
}

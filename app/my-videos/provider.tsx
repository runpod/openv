"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface MonthlyQuota {
	remainingSeconds: number;
	currentUsage: number;
	limitSeconds: number;
}

interface MyVideosContextType {
	hasAccess: boolean;
	monthlyQuota?: MonthlyQuota;
	updateMonthlyQuota: (quota: MonthlyQuota) => void;
}

const MyVideosContext = createContext<MyVideosContextType | null>(null);

export function useMyVideos() {
	const context = useContext(MyVideosContext);
	if (!context) throw new Error("useMyVideos must be used within MyVideosProvider");
	return context;
}

export function MyVideosProvider({
	hasAccess,
	monthlyQuota: initialQuota,
	children,
}: {
	hasAccess: boolean;
	monthlyQuota?: MonthlyQuota;
	children: React.ReactNode;
}) {
	const [monthlyQuota, setMonthlyQuota] = useState<MonthlyQuota | undefined>(initialQuota);

	const updateMonthlyQuota = useCallback((newQuota: MonthlyQuota) => {
		setMonthlyQuota(newQuota);
	}, []);

	return (
		<MyVideosContext.Provider value={{ hasAccess, monthlyQuota, updateMonthlyQuota }}>
			<div className="w-full">{children}</div>
		</MyVideosContext.Provider>
	);
}

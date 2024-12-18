"use client";

import { createContext, useContext } from "react";

interface MyVideosContextType {
	hasAccess: boolean;
}

const MyVideosContext = createContext<MyVideosContextType | null>(null);

export function useMyVideos() {
	const context = useContext(MyVideosContext);
	if (!context) throw new Error("useMyVideos must be used within MyVideosProvider");
	return context;
}

export function MyVideosProvider({
	hasAccess,
	children,
}: {
	hasAccess: boolean;
	children: React.ReactNode;
}) {
	return (
		<MyVideosContext.Provider value={{ hasAccess }}>
			<div className="w-full">{children}</div>
		</MyVideosContext.Provider>
	);
}

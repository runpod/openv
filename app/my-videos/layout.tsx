"use client";

import AuthenticatedLayout from "@/components/layout/authenticated-layout";

export default function MyVideosLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthenticatedLayout>
			<div className="w-full">{children}</div>
		</AuthenticatedLayout>
	);
}

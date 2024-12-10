"use client";

import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import { useVideosStore } from "@/hooks/use-videos-store";

export default function MyVideosLayout({ children }: { children: React.ReactNode }) {
	const { isSettingsOpen, videoSettings, setVideoSettings } = useVideosStore();

	return (
		<AuthenticatedLayout>
			<div className="w-full">{children}</div>
		</AuthenticatedLayout>
	);
}

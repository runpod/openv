"use client";

import InspirationGrid from "@/components/inspiration-grid";
import { useVideosStore } from "@/hooks/use-videos-store";

export default function InspirationPage() {
	const { setPrompt, setSeed, gridView, setGridView, searchQuery, setSearchQuery } =
		useVideosStore();

	const applyVideoSettings = (video: { prompt: string; frames?: number; seed?: number }) => {
		setPrompt(video.prompt);
		if (video.seed) setSeed(video.seed);
	};

	return (
		<div className="px-4">
			<InspirationGrid
				applyVideoSettings={applyVideoSettings}
				gridView={gridView}
				setGridView={setGridView}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
		</div>
	);
}

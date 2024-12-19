"use client";

import { VideoGrid } from "@/components/video-grid";
import { inspirationData } from "@/lib/inspiration-data";
import { useVideosStore } from "@/store/video-store";
import { Video } from "@/types";

export default function InspirationPage() {
	const { setPrompt, setSeed, gridView, setGridView, searchQuery, setSearchQuery } =
		useVideosStore();

	// Convert inspiration data to Video format
	const videos: Video[] = inspirationData.map((item, index) => ({
		id: index + 1,
		jobId: "inspiration",
		userId: "inspiration",
		prompt: item.prompt,
		status: "completed",
		url: item.video,
		frames: item.num_frames,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		seed: item.seed,
	}));

	const handleCopySettings = (video: Video) => {
		setPrompt(video.prompt);
		if (video.seed) setSeed(video.seed);
	};

	return (
		<div className="px-4">
			<VideoGrid
				videos={videos}
				gridView={gridView}
				setGridView={setGridView}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onDelete={() => {}}
				onCopySettings={handleCopySettings}
				sortOption="newest"
				setSortOption={() => {}}
				title="Inspiration"
			/>
		</div>
	);
}

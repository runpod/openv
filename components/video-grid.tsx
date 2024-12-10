import React from "react";

import { useVideosStore } from "@/hooks/use-videos-store";
import { Video } from "@/types";

import VideoCard from "./video-card";
import VideoControls from "./video-controls";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

type VideoGridProps = {
	videos: Video[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onDelete: (id: string) => void;
	onCopySettings: (video: Video) => void;
	sortOption: SortOption;
	setSortOption: (option: SortOption) => void;
};

const VideoGrid: React.FC<VideoGridProps> = ({
	videos = [],
	searchQuery,
	setSearchQuery,
	onDelete,
	onCopySettings,
	sortOption,
	setSortOption,
}) => {
	const { gridView } = useVideosStore();

	const getGridClass = () => {
		switch (gridView) {
			case "2x2":
				return "grid grid-cols-1 sm:grid-cols-2";
			case "3x3":
				return "grid grid-cols-2 sm:grid-cols-4";
			case "list":
				return "flex flex-col";
			default:
				return "grid-cols-1 sm:grid-cols-2";
		}
	};

	const filteredVideos = Array.isArray(videos)
		? videos.filter(video => video.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
		: [];

	const sortedVideos = [...filteredVideos].sort((a, b) => {
		switch (sortOption) {
			case "newest":
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			case "oldest":
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case "name_asc":
				return a.prompt.localeCompare(b.prompt);
			case "name_desc":
				return b.prompt.localeCompare(a.prompt);
			default:
				return 0;
		}
	});

	return (
		<div className="bg-[hsl(var(--section-background))] rounded-lg">
			<div className="flex justify-end items-center p-2">
				<VideoControls
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					sortOption={sortOption}
					setSortOption={setSortOption}
				/>
			</div>

			<div className="p-4">
				{!Array.isArray(videos) || videos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">No videos yet :(</p>
				) : sortedVideos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">
						No videos match your search.
					</p>
				) : (
					<div
						className={`${getGridClass()} ${
							gridView === "list" ? "space-y-4" : "gap-4"
						} w-full`}
					>
						{sortedVideos.map(video => (
							<VideoCard
								key={video.id}
								video={video}
								onDelete={onDelete}
								onCopySettings={onCopySettings}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoGrid;

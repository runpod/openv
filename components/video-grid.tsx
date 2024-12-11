import React from "react";

import { cn } from "@/lib/utils";
import { Video } from "@/types";

import VideoCard from "./video-card";
import VideoControls from "./video-controls";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

interface VideoGridProps {
	videos: Video[];
	gridView: "2x2" | "3x3" | "list";
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onDelete: (id: string) => void;
	onCopySettings: (video: { prompt: string; frames: number; seed: number }) => void;
	sortOption: "newest" | "oldest" | "name_asc" | "name_desc";
	setSortOption: (option: "newest" | "oldest" | "name_asc" | "name_desc") => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
	videos = [],
	gridView,
	setGridView,
	searchQuery,
	setSearchQuery,
	onDelete,
	onCopySettings,
	sortOption,
	setSortOption,
}) => {
	const getGridClass = () => {
		switch (gridView) {
			case "2x2":
				return "grid grid-cols-1 sm:grid-cols-2 gap-6";
			case "3x3":
				return "grid grid-cols-2 sm:grid-cols-4 gap-6";
			case "list":
				return "flex flex-col space-y-1";
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
			<div className="flex items-center gap-6 p-4">
				<h3 className="text-lg font-semibold shrink-0">My Videos</h3>
				<VideoControls
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					sortOption={sortOption}
					setSortOption={setSortOption}
					gridView={gridView}
					setGridView={setGridView}
				/>
			</div>

			<div className={cn("p-4", gridView === "list" && "px-2")}>
				{!Array.isArray(videos) || videos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">No videos yet :(</p>
				) : sortedVideos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">
						No videos match your search.
					</p>
				) : (
					<div
						className={`${getGridClass()} ${
							gridView === "list" ? "space-y-1" : "gap-4"
						} w-full`}
					>
						{sortedVideos.map(video => (
							<VideoCard
								key={video.id}
								video={video}
								onDelete={onDelete}
								onCopySettings={onCopySettings}
								isListView={gridView === "list"}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoGrid;

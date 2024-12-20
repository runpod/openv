import { cn } from "@/lib/utils";
import { useVideosStore } from "@/store/video-store";
import { Video } from "@/types";

import { VideoCard } from "./video-card";
import { VideoControls } from "./video-controls";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

interface VideoGridProps {
	videos: Video[];
	gridView: "2x2" | "3x3" | "list";
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onDelete: (id: number) => void;
	onCopySettings: (video: Video) => void;
	sortOption: SortOption;
	setSortOption: (option: SortOption) => void;
	title?: string;
}

export function VideoGrid({
	videos = [],
	gridView,
	setGridView,
	searchQuery,
	setSearchQuery,
	onDelete,
	onCopySettings,
	sortOption,
	setSortOption,
	title = "My Videos",
}: VideoGridProps) {
	const { selectedVideoIds, toggleVideoSelection } = useVideosStore();

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

	const filteredVideos = videos.filter(video => {
		if (!searchQuery) return true;
		return (video.prompt || "").toLowerCase().includes(searchQuery.toLowerCase());
	});

	const sortedVideos = [...filteredVideos].sort((a, b) => {
		switch (sortOption) {
			case "newest":
				// First, prioritize processing/queued videos
				if (
					(a.status === "processing" || a.status === "queued") &&
					b.status !== "processing" &&
					b.status !== "queued"
				)
					return -1;
				if (
					(b.status === "processing" || b.status === "queued") &&
					a.status !== "processing" &&
					a.status !== "queued"
				)
					return 1;

				// Then sort by creation date
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

			case "oldest":
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case "name_asc":
				return (a.prompt || "").localeCompare(b.prompt || "");
			case "name_desc":
				return (b.prompt || "").localeCompare(a.prompt || "");
			default:
				return 0;
		}
	});

	return (
		<div className="bg-[hsl(var(--section-background))] rounded-lg">
			<div className="flex items-center gap-6 p-4">
				<h3 className="text-lg font-semibold shrink-0">{title}</h3>
				<VideoControls
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					sortOption={sortOption}
					setSortOption={setSortOption}
					gridView={gridView}
					setGridView={setGridView}
					videos={sortedVideos}
				/>
			</div>

			<div className={cn("p-4", gridView === "list" && "px-2")}>
				{videos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">No videos yet :(</p>
				) : sortedVideos.length === 0 ? (
					<p className="text-center text-muted-foreground py-8">
						No videos match your search.
					</p>
				) : (
					<div
						className={cn(
							getGridClass(),
							gridView === "list" ? "space-y-1" : "gap-4",
							"w-full"
						)}
					>
						{sortedVideos.map(video => (
							<VideoCard
								key={video.id}
								video={video}
								onDelete={onDelete}
								onCopySettings={onCopySettings}
								isListView={gridView === "list"}
								isSelected={selectedVideoIds.includes(video.id)}
								onToggleSelect={toggleVideoSelection}
								gridView={gridView}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default VideoGrid;

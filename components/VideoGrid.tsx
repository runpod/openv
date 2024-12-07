import { ChevronDown, ChevronUp, Film, Lightbulb } from "lucide-react";
import React from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { QueueItem as QueueItemType, Video } from "./HomePage";
import QueueItem from "./QueueItem";
import VideoCard from "./VideoCard";
import VideoControls from "./VideoControls";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

type GridView = "2x2" | "3x3" | "list";

type VideoGridProps = {
	videos: Video[];
	queue: QueueItemType[];
	gridView: GridView;
	setGridView: (view: GridView) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onDelete: (id: string) => void;
	onCopySettings: (video: Video) => void;
	sortOption: SortOption;
	setSortOption: (option: SortOption) => void;
	inspirationContent: React.ReactNode;
};

const VideoGrid: React.FC<VideoGridProps> = ({
	videos,
	queue,
	gridView,
	setGridView,
	searchQuery,
	setSearchQuery,
	onDelete,
	onCopySettings,
	sortOption,
	setSortOption,
	inspirationContent,
}) => {
	const [isQueueOpen, setIsQueueOpen] = React.useState(true);

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

	const filteredVideos = videos.filter(
		video =>
			video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) &&
			video.status === "completed" &&
			!queue.some(item => item.id === video.id)
	);

	const sortedVideos = [...filteredVideos].sort((a, b) => {
		switch (sortOption) {
			case "newest":
				return new Date(b.id).getTime() - new Date(a.id).getTime();
			case "oldest":
				return new Date(a.id).getTime() - new Date(b.id).getTime();
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
			<Tabs defaultValue="my-videos" className="space-y-4">
				<div className="flex justify-between items-center">
					<TabsList className="bg-background p-1 rounded-lg">
						<TabsTrigger
							value="inspiration"
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ease-in-out",
								"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
								"data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground",
								"hover:bg-muted hover:text-foreground"
							)}
						>
							<Lightbulb className="w-4 h-4" />
							Inspiration
						</TabsTrigger>
						<TabsTrigger
							value="my-videos"
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ease-in-out",
								"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
								"data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground",
								"hover:bg-muted hover:text-foreground"
							)}
						>
							<Film className="w-4 h-4" />
							My Videos
							<span className="ml-2 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
								{videos.length}
							</span>
						</TabsTrigger>
					</TabsList>
					<VideoControls
						gridView={gridView}
						setGridView={setGridView}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						sortOption={sortOption}
						setSortOption={setSortOption}
					/>
				</div>

				<TabsContent
					value="inspiration"
					className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					{inspirationContent}
				</TabsContent>

				<TabsContent
					value="my-videos"
					className="mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				>
					<Collapsible
						open={isQueueOpen}
						onOpenChange={setIsQueueOpen}
						className="w-full space-y-2 mb-4"
					>
						<CollapsibleTrigger className="flex items-center justify-between w-full p-2 font-medium text-left bg-muted hover:bg-muted/80 rounded-md transition-colors duration-200">
							Queue ({queue.length})
							{isQueueOpen ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</CollapsibleTrigger>
						<CollapsibleContent className="space-y-2">
							{queue.map(item => (
								<QueueItem key={item.id} item={item} />
							))}
						</CollapsibleContent>
					</Collapsible>
					{videos.length === 0 ? (
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
									gridView={gridView}
									onDelete={onDelete}
									onCopySettings={onCopySettings}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default VideoGrid;

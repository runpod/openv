import { Grid2X2, Grid3X3, Search, SortAsc } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useVideosStore } from "@/store/video-store";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

interface VideoControlsProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	sortOption: SortOption;
	setSortOption: (option: SortOption) => void;
	gridView: "2x2" | "3x3" | "list";
	setGridView: (view: "2x2" | "3x3" | "list") => void;
	videos: { id: number }[];
}

export function VideoControls({
	searchQuery,
	setSearchQuery,
	sortOption,
	setSortOption,
	gridView,
	setGridView,
	videos,
}: VideoControlsProps) {
	const {
		selectedVideoIds,
		toggleVideoSelection,
		clearVideoSelection,
		deleteSelectedVideos,
		selectMode,
		setSelectMode,
	} = useVideosStore();

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			videos.forEach(video => {
				if (!selectedVideoIds.includes(video.id)) {
					toggleVideoSelection(video.id);
				}
			});
		} else {
			clearVideoSelection();
		}
	};

	const handleDeleteSelected = async () => {
		try {
			await deleteSelectedVideos();
			setSelectMode(false);
			setIsDeleteModalOpen(false);
		} catch (error) {
			console.error("Failed to delete selected videos:", error);
		}
	};

	// Calculate if all visible videos are selected
	const allVisibleSelected =
		videos.length > 0 && videos.every(video => selectedVideoIds.includes(video.id));
	// Calculate if some visible videos are selected
	const someVisibleSelected = videos.some(video => selectedVideoIds.includes(video.id));

	return (
		<>
			<div
				className={cn(
					"flex items-center justify-between gap-2 bg-background",
					selectMode && "sticky top-0 z-20 border-b py-2"
				)}
			>
				{/* Selection functionality is temporarily hidden until we have time to fix and properly test it
				<div className="flex items-center gap-2 w-[180px]">
					{videos.length > 0 && (
						<>
							{selectMode ? (
								<div className="flex items-center gap-2">
									<Checkbox
										checked={allVisibleSelected || someVisibleSelected}
										ref={ref => {
											if (!ref) return;
											ref.indeterminate =
												someVisibleSelected && !allVisibleSelected;
										}}
										onCheckedChange={handleSelectAll}
										aria-label="Select all visible videos"
									/>
									{selectedVideoIds.length > 0 && (
										<Button
											variant="destructive"
											size="icon"
											onClick={() => setIsDeleteModalOpen(true)}
											className="h-8 w-8"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setSelectMode(false)}
										className="h-8 w-8"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div
									onClick={() => setSelectMode(true)}
									className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
								>
									<Checkbox className="h-4 w-4" checked={false} />
									<span>Select</span>
								</div>
							)}
						</>
					)}
				</div>
				*/}

				<div className="flex-1" />
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setGridView("2x2")}
							className={cn(gridView === "2x2" && "bg-accent")}
						>
							<Grid2X2 className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setGridView("3x3")}
							className={cn(gridView === "3x3" && "bg-accent")}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<SortAsc className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setSortOption("newest")}>
								Newest
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortOption("oldest")}>
								Oldest
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortOption("name_asc")}>
								Name (A-Z)
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortOption("name_desc")}>
								Name (Z-A)
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="relative w-64">
						<Input
							type="text"
							placeholder="Search videos..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
						<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					</div>
				</div>
			</div>

			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Selected Videos</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete {selectedVideoIds.length} selected video
							{selectedVideoIds.length === 1 ? "" : "s"}? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteSelected}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

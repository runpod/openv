import { Grid2X2, Grid3X3, List, Search, SortAsc } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

interface VideoControlsProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	sortOption: SortOption;
	setSortOption: (option: SortOption) => void;
	gridView: "2x2" | "3x3" | "list";
	setGridView: (view: "2x2" | "3x3" | "list") => void;
}

export function VideoControls({
	searchQuery,
	setSearchQuery,
	sortOption,
	setSortOption,
	gridView,
	setGridView,
}: VideoControlsProps) {
	return (
		<div className="flex items-center justify-end gap-2">
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
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setGridView("list")}
					className={cn(gridView === "list" && "bg-accent")}
				>
					<List className="h-4 w-4" />
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
	);
}

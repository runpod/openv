"use client";

import {
	AlertCircle,
	Check,
	Clock3,
	Copy,
	Dices,
	Download,
	Loader2,
	MoreVertical,
	Trash2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getSeconds } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useVideosStore } from "@/store/video-store";
import { Video } from "@/types";

interface VideoCardProps {
	video: Video;
	onDelete: (id: number) => void;
	onCopySettings: (video: Video) => void;
	isListView?: boolean;
	isSelected?: boolean;
	onToggleSelect?: (id: number) => void;
	gridView: "2x2" | "3x3" | "list";
}

export function VideoCard({
	video,
	onDelete,
	onCopySettings,
	isListView,
	isSelected,
	onToggleSelect,
	gridView,
}: VideoCardProps) {
	const [copiedSettings, setCopiedSettings] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const selectMode = useVideosStore(state => state.selectMode);

	const handleDelete = () => {
		onDelete(video.id);
	};

	const handleCopySettings = () => {
		onCopySettings(video);
		setCopiedSettings(video.id);
		setTimeout(() => setCopiedSettings(null), 1000);
	};

	const handleDownload = () => {
		if (video.status === "completed" && video.url) {
			window.open(video.url, "_blank");
		}
	};

	const hasValidUrl = video.url && video.url.length > 0;

	const duration = getSeconds(video.frames ?? 0);

	if (isListView) {
		return (
			<div className="flex items-center justify-between py-2 px-3 bg-card hover:bg-accent/50 rounded-md">
				<div className="flex items-center space-x-4 flex-grow">
					{selectMode && onToggleSelect && (
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onToggleSelect(video.id)}
							className="mr-2"
						/>
					)}
					<div className="flex-grow">
						<p className="text-sm truncate max-w-[400px]">{video.prompt}</p>
						<div className="flex items-center space-x-3 text-xs text-muted-foreground mt-0.5">
							{video.frames && (
								<span className="flex items-center">
									<Clock3 className="h-3 w-3 mr-1" />
									{duration}s
								</span>
							)}
							{video.seed && (
								<span className="flex items-center">
									<Dices className="h-3 w-3 mr-1" />
									{video.seed}
								</span>
							)}
							{video.status === "processing" && (
								<span className="flex items-center text-blue-500">
									<Loader2 className="h-3 w-3 mr-1 animate-spin" />
									Processing
								</span>
							)}
							{video.status === "queued" && (
								<span className="flex items-center text-yellow-500">
									<Clock3 className="h-3 w-3 mr-1" />
									Queued
								</span>
							)}
							{video.status === "failed" && (
								<span className="flex items-center text-destructive">
									<AlertCircle className="h-3 w-3 mr-1" />
									Failed
									{video.error && `: ${video.error}`}
								</span>
							)}
						</div>
					</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-7 w-7 p-0">
							<MoreVertical className="h-3 w-3" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleCopySettings}>
							{copiedSettings === video.id ? (
								<Check className="h-3 w-3 mr-2" />
							) : (
								<Copy className="h-3 w-3 mr-2" />
							)}
							Copy settings
						</DropdownMenuItem>
						{video.status === "completed" && video.url && (
							<DropdownMenuItem onClick={handleDownload}>
								<Download className="h-3 w-3 mr-2" />
								Download
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => setIsDeleteModalOpen(true)}
							className="text-destructive"
						>
							<Trash2 className="h-3 w-3 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Are you sure you want to delete this video?</DialogTitle>
							<DialogDescription>
								This action cannot be undone. This will permanently delete your
								video.
							</DialogDescription>
						</DialogHeader>
						<div className="mt-2 flex items-start space-x-4">
							{hasValidUrl ? (
								<video src={video.url} className="w-24 h-24 object-cover rounded">
									Your browser does not support the video tag.
								</video>
							) : (
								<div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
									<AlertCircle className="h-8 w-8 text-destructive" />
								</div>
							)}
							<p className="text-sm text-muted-foreground">{video.prompt}</p>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									handleDelete();
									setIsDeleteModalOpen(false);
								}}
							>
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	return (
		<Card className="w-full overflow-hidden">
			<CardContent className="p-0">
				<div className="relative">
					{selectMode && onToggleSelect && (
						<div className="absolute top-2 left-2 z-10">
							<Checkbox
								checked={isSelected}
								onCheckedChange={() => onToggleSelect(video.id)}
								className="bg-background/80 backdrop-blur-sm"
							/>
						</div>
					)}
					{video.status === "processing" || video.status === "queued" ? (
						<div
							className={cn(
								"bg-gray-200 w-full",
								gridView === "3x3" ? "h-80" : "h-auto aspect-video"
							)}
						>
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
								<div className="animate-spin rounded-full border-t-2 border-b-2 border-white h-16 w-16"></div>
							</div>
						</div>
					) : !hasValidUrl ? (
						<div
							className={cn(
								"bg-gray-200 w-full flex items-center justify-center",
								gridView === "3x3" ? "h-80" : "h-auto aspect-video"
							)}
						>
							<div className="flex flex-col items-center gap-2 text-destructive">
								<AlertCircle className="h-16 w-16" />
								<Badge variant="destructive" className="text-sm">
									{video.error || "Failed"}
								</Badge>
							</div>
						</div>
					) : (
						<video
							src={video.url}
							controls
							className={cn(
								"w-full object-cover",
								gridView === "3x3" ? "h-80" : "h-auto"
							)}
						>
							Your browser does not support the video tag.
						</video>
					)}
				</div>
				<div className="p-4">
					<div className="flex items-center justify-between mb-2">
						<p className="text-sm text-muted-foreground">{video.prompt}</p>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleCopySettings}>
									{copiedSettings === video.id ? (
										<Check className="h-4 w-4 mr-2" />
									) : (
										<Copy className="h-4 w-4 mr-2" />
									)}
									Copy settings
								</DropdownMenuItem>
								{video.status === "completed" && video.url && (
									<DropdownMenuItem onClick={handleDownload}>
										<Download className="h-4 w-4 mr-2" />
										Download
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onClick={() => setIsDeleteModalOpen(true)}
									className="text-destructive"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
						{video.frames && (
							<span className="flex items-center">
								<Clock3 className="h-3 w-3 mr-1" />
								{duration}s
							</span>
						)}
						{video.seed && (
							<span className="flex items-center">
								<Dices className="h-3 w-3 mr-1" />
								{video.seed}
							</span>
						)}
						{video.status === "processing" && (
							<span className="flex items-center text-blue-500">
								<Loader2 className="h-3 w-3 mr-1 animate-spin" />
								Processing
							</span>
						)}
						{video.status === "queued" && (
							<span className="flex items-center text-yellow-500">
								<Clock3 className="h-3 w-3 mr-1" />
								Queued
							</span>
						)}
						{video.status === "failed" && (
							<span className="flex items-center text-destructive">
								<AlertCircle className="h-3 w-3 mr-1" />
								Failed
								{video.error && `: ${video.error}`}
							</span>
						)}
					</div>
				</div>
			</CardContent>
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you sure you want to delete this video?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete your video.
						</DialogDescription>
					</DialogHeader>
					<div className="mt-2 flex items-start space-x-4">
						{hasValidUrl ? (
							<video src={video.url} className="w-24 h-24 object-cover rounded">
								Your browser does not support the video tag.
							</video>
						) : (
							<div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
								<AlertCircle className="h-8 w-8 text-destructive" />
							</div>
						)}
						<p className="text-sm text-muted-foreground">{video.prompt}</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								handleDelete();
								setIsDeleteModalOpen(false);
							}}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}

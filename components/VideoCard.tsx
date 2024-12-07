"use client";

import { Check, Clock3, Copy, Dices, Download, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type VideoStatus = "generating" | "completed" | "failed";

type Video = {
	id: string;
	prompt: string;
	frames: number;
	url: string;
	seed: number;
	status: VideoStatus;
	enhancePrompt: boolean;
	enhancedPromptText?: string;
};

type GridView = "2x2" | "3x3" | "list";

type VideoCardProps = {
	video: Video | undefined;
	gridView: GridView;
	onDelete: (id: string) => void;
	onCopySettings: (video: Video) => void;
};

export default function VideoCard({ video, gridView, onDelete, onCopySettings }: VideoCardProps) {
	const [copiedSettings, setCopiedSettings] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const { toast } = useToast();

	if (!video) {
		return null; // or return a placeholder component
	}

	const applyVideoSettings = (video: Video) => {
		// Add your logic to apply video settings
		setCopiedSettings(video.id);
		setTimeout(() => setCopiedSettings(null), 1000);
	};

	const deleteVideo = (id: string) => {
		// Add your logic to delete the video
		onDelete(id);
	};

	const getSeconds = (frames: number) => {
		return (frames / 24).toFixed(2);
	};

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

	return (
		<Card
			className={`w-full overflow-hidden ${gridView === "list" ? "flex items-center" : ""}`}
		>
			<CardContent className={`p-0 ${gridView === "list" ? "flex items-center w-full" : ""}`}>
				<div
					className={`relative ${
						gridView === "list" ? "w-12 h-12 flex-shrink-0 mr-4" : ""
					}`}
				>
					{video.status === "generating" ? (
						<div
							className={`bg-gray-200 ${
								gridView === "list" ? "w-12 h-12" : "w-full h-80"
							}`}
						>
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
								<div
									className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${
										gridView === "list" ? "h-6 w-6" : "h-16 w-16"
									}`}
								></div>
							</div>
						</div>
					) : (
						<img
							src={video.url}
							alt={video.prompt}
							className={`object-cover ${
								gridView === "list" ? "w-12 h-12" : "w-full h-80"
							}`}
						/>
					)}
				</div>
				<div
					className={`${
						gridView === "list" ? "flex-grow flex justify-between items-center" : "p-4"
					}`}
				>
					<div className={gridView === "list" ? "flex-grow mr-4" : ""}>
						<p
							className={`text-sm ${
								gridView === "list"
									? "text-foreground truncate"
									: "text-muted-foreground"
							} ${gridView === "list" ? "mb-0" : "mb-2"}`}
						>
							{video.prompt}
						</p>
						<div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
							<span className="flex items-center">
								<Clock3 className="h-3 w-3 mr-1" />
								{getSeconds(video.frames)}s ({video.frames} frames)
							</span>
							{video.enhancePrompt && (
								<span
									className="flex items-center cursor-pointer"
									onClick={() => {
										toast({
											title: "Enhanced Prompt",
											description:
												video.enhancedPromptText ||
												"No enhanced prompt available",
										});
									}}
								>
									<Sparkles className="h-3 w-3 mr-1" />
									Prompt
								</span>
							)}
							<span className="flex items-center">
								<Dices className="h-3 w-3 mr-1" />
								{video.seed}
							</span>
						</div>
					</div>
					<div
						className={`flex ${
							gridView === "list" ? "flex-shrink-0" : "justify-end mt-2"
						} items-center space-x-2`}
					>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={handleCopySettings}
						>
							{copiedSettings === video.id ? (
								<Check className="h-4 w-4" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={handleDownload}
							disabled={video.status !== "completed"}
						>
							<Download className="h-4 w-4" />
						</Button>
						<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
							<DialogTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => setIsDeleteModalOpen(true)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Are you sure you want to delete this video?
									</DialogTitle>
									<DialogDescription>
										This action cannot be undone. This will permanently delete
										your video.
									</DialogDescription>
								</DialogHeader>
								<div className="mt-2 flex items-start space-x-4">
									<img
										src={video.url}
										alt={video.prompt}
										className="w-24 h-24 object-cover rounded"
									/>
									<p className="text-sm text-muted-foreground">{video.prompt}</p>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setIsDeleteModalOpen(false)}
									>
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
				</div>
			</CardContent>
		</Card>
	);
}

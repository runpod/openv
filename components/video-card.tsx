"use client";

import {
	AlertCircle,
	Check,
	Clock3,
	Copy,
	Dices,
	Download,
	Loader2,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { Video } from "@/types";

type VideoCardProps = {
	video: Video;
	onDelete: (id: string) => void;
	onCopySettings: (video: Video) => void;
	isListView?: boolean;
};

export default function VideoCard({ video, onDelete, onCopySettings, isListView }: VideoCardProps) {
	const [copiedSettings, setCopiedSettings] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const { toast } = useToast();

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

	const hasValidUrl = video.url && video.url.length > 0;

	if (isListView) {
		return (
			<div className="flex items-center justify-between py-2 px-3 bg-card hover:bg-accent/50 rounded-md">
				<div className="flex items-center space-x-4 flex-grow">
					<div className="flex-grow">
						<p className="text-sm truncate max-w-[400px]">{video.prompt}</p>
						<div className="flex items-center space-x-3 text-xs text-muted-foreground mt-0.5">
							<span className="flex items-center">
								<Clock3 className="h-3 w-3 mr-1" />
								{getSeconds(video.frames)}s
							</span>
							<span className="flex items-center">
								<Dices className="h-3 w-3 mr-1" />
								{video.seed}
							</span>
							{video.status === "generating" && (
								<span className="flex items-center text-blue-500">
									<Loader2 className="h-3 w-3 mr-1 animate-spin" />
									Processing
								</span>
							)}
							{video.status === "failed" && (
								<span className="flex items-center text-destructive">
									<AlertCircle className="h-3 w-3 mr-1" />
									Failed
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center space-x-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						onClick={handleCopySettings}
					>
						{copiedSettings === video.id ? (
							<Check className="h-3 w-3" />
						) : (
							<Copy className="h-3 w-3" />
						)}
					</Button>
					{video.status === "completed" && video.url && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 w-7 p-0"
							onClick={handleDownload}
						>
							<Download className="h-3 w-3" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0 hover:text-destructive"
						onClick={() => setIsDeleteModalOpen(true)}
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				</div>
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
					{video.status === "generating" ? (
						<div className="bg-gray-200 w-full h-80">
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
								<div className="animate-spin rounded-full border-t-2 border-b-2 border-white h-16 w-16"></div>
							</div>
						</div>
					) : !hasValidUrl ? (
						<div className="bg-gray-200 w-full h-80 flex items-center justify-center">
							<div className="flex flex-col items-center gap-2 text-destructive">
								<AlertCircle className="h-16 w-16" />
								<Badge variant="destructive" className="text-sm">
									Broken
								</Badge>
							</div>
						</div>
					) : (
						<video src={video.url} controls className="w-full h-80 object-cover">
							Your browser does not support the video tag.
						</video>
					)}
				</div>
				<div className="p-4">
					<p className="text-sm text-muted-foreground mb-2">{video.prompt}</p>
					<div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
						<span className="flex items-center">
							<Clock3 className="h-3 w-3 mr-1" />
							{getSeconds(video.frames)}s
						</span>
						{video.enhancePrompt && (
							<span
								className="flex items-center cursor-pointer"
								onClick={() => {
									toast({
										title: "Enhanced Prompt",
										description: "No enhanced prompt available",
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
					<div className="flex justify-end mt-2 items-center space-x-2">
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
							disabled={!hasValidUrl}
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
									{hasValidUrl ? (
										<video
											src={video.url}
											className="w-24 h-24 object-cover rounded"
										>
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

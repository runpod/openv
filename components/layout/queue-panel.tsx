"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";
import { useVideosStore } from "@/hooks/use-videos-store";
import { QueueItem as QueueItemType } from "@/types";

import { QueueItem } from "./queue-item";

type QueuePanelProps = {
	queue: QueueItemType[];
};

interface RunPodResponse {
	status: string;
	output?: {
		result: string;
		downloadUrl: string;
	};
	error?: string;
}

export function QueuePanel({ queue }: QueuePanelProps) {
	const [isOpen, setIsOpen] = useState(true);
	const hasProcessingItems = queue.some(item => item.status === "processing");
	const updateVideoStatus = useVideosStore(state => state.updateVideoStatus);
	const videos = useVideosStore(state => state.videos);
	const { toast } = useToast();

	useEffect(() => {
		if (!hasProcessingItems) return;

		const checkStatus = async () => {
			const processingItems = queue
				.filter(item => item.status === "processing")
				.map(item => {
					const video = videos.find(v => v.id === item.id);
					return {
						...item,
						jobId: video?.jobId,
					};
				})
				.filter(item => item.jobId);

			for (const item of processingItems) {
				try {
					const response = await fetch(`/api/runpod/${item.jobId}`);
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					const data = (await response.json()) as RunPodResponse;
					console.log("RunPod response for job", item.jobId, ":", data);

					if (data.error) {
						console.error("RunPod API error:", data.error);
						continue;
					}

					if (data.status === "COMPLETED" && data.output) {
						updateVideoStatus(item.id, "completed", data.output.result);
						toast({
							title: "Video completed",
							description: `Video "${item.prompt}" has been generated successfully.`,
						});
					} else if (data.status === "FAILED") {
						updateVideoStatus(item.id, "failed");
						toast({
							title: "Video generation failed",
							description: `Failed to generate video "${item.prompt}".`,
							variant: "destructive",
						});
					}
				} catch (error) {
					console.error(`Failed to check status for job ${item.jobId}:`, error);
					toast({
						title: "Error checking status",
						description: "Failed to check video generation status.",
						variant: "destructive",
					});
				}
			}
		};

		const intervalId = setInterval(checkStatus, 5000);
		checkStatus(); // Run immediately on mount

		return () => clearInterval(intervalId);
	}, [hasProcessingItems, queue, updateVideoStatus, toast, videos]);

	return (
		<section className="sticky top-0 h-screen w-[30vw] flex-shrink-0 border-l border-border p-4 overflow-y-auto">
			<Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
				<CollapsibleTrigger className="sticky top-0 z-10 flex items-center justify-between w-full p-2 font-medium text-left bg-muted hover:bg-muted/80 rounded-md transition-colors duration-200">
					<div className="flex items-center gap-2">
						Queue ({queue.length})
						{hasProcessingItems && (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						)}
					</div>
					{isOpen ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-2">
					{queue.length === 0 ? (
						<div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
							Queue is empty
						</div>
					) : (
						<div className="grid grid-cols-2 gap-2">
							{queue.map(item => (
								<QueueItem key={item.id} item={item} />
							))}
						</div>
					)}
				</CollapsibleContent>
			</Collapsible>
		</section>
	);
}

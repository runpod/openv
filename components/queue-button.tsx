"use client";

import { Clock, ListIcon, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface QueueItem {
	id: string;
	prompt: string;
	status: "queued" | "processing" | "completed";
}

interface QueueButtonProps {
	queueItems: QueueItem[];
	isProcessing: boolean;
}

export function QueueButton({ queueItems, isProcessing }: QueueButtonProps) {
	const [open, setOpen] = useState(false);

	const getStatusIcon = (status: QueueItem["status"]) => {
		switch (status) {
			case "queued":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case "processing":
				return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
		}
	};

	const activeQueueItems = queueItems.filter(item => item.status !== "completed");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs flex items-center space-x-1">
					<ListIcon className="h-3 w-3" />
					<span>{activeQueueItems.length}</span>
					{isProcessing && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-4">
					<h4 className="font-medium leading-none">Queue</h4>
					{activeQueueItems.length === 0 ? (
						<p className="text-sm text-muted-foreground">No items in queue</p>
					) : (
						<ul className="space-y-2">
							{activeQueueItems.map(item => (
								<li key={item.id} className="text-sm flex items-center space-x-2">
									{getStatusIcon(item.status)}
									<span>
										{item.prompt.length > 40
											? `${item.prompt.slice(0, 40)}...`
											: item.prompt}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

"use client";

import { RatioIcon as AspectRatio } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AspectRatioSelectorProps {
	aspectRatio: "16:9" | "9:16" | "1:1";
	onChange: (aspectRatio: "16:9" | "9:16" | "1:1") => void;
}

export function AspectRatioSelector({ aspectRatio, onChange }: AspectRatioSelectorProps) {
	const [open, setOpen] = useState(false);

	const aspectRatios = [
		{ label: "16:9", width: 848, height: 480 },
		{ label: "9:16", width: 480, height: 848 },
		{ label: "1:1", width: 640, height: 640 },
	];

	const handleAspectRatioChange = (newAspectRatio: "16:9" | "9:16" | "1:1") => {
		onChange(newAspectRatio);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<AspectRatio className="mr-1 h-3 w-3" />
					{aspectRatio}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-48 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Aspect Ratio</h4>
					<p className="text-sm text-muted-foreground">
						Select the aspect ratio for your video
					</p>
					<div className="flex flex-col space-y-2">
						{aspectRatios.map(ratio => (
							<Button
								key={ratio.label}
								variant={aspectRatio === ratio.label ? "default" : "outline"}
								onClick={() =>
									handleAspectRatioChange(ratio.label as "16:9" | "9:16" | "1:1")
								}
								className="justify-start"
							>
								{ratio.label} ({ratio.width}x{ratio.height})
							</Button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

"use client";

import { RatioIcon as AspectRatio } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AspectRatioSelectorProps {
	aspectRatio: "16:9" | "9:16" | "1:1";
	onChange: (aspectRatio: "16:9" | "9:16" | "1:1") => void;
}

const AspectRatioIcon = ({ ratio }: { ratio: "16:9" | "9:16" | "1:1" }) => {
	switch (ratio) {
		case "16:9":
			return (
				<svg
					viewBox="0 0 24 24"
					className="h-4 w-4 mr-2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<rect x="3" y="6" width="18" height="12" rx="1" />
				</svg>
			);
		case "9:16":
			return (
				<svg
					viewBox="0 0 24 24"
					className="h-4 w-4 mr-2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<rect x="7" y="3" width="10" height="18" rx="1" />
				</svg>
			);
		case "1:1":
			return (
				<svg
					viewBox="0 0 24 24"
					className="h-4 w-4 mr-2"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<rect x="5" y="5" width="14" height="14" rx="1" />
				</svg>
			);
	}
};

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
				<Button variant="outline" className="h-8 w-[68px] px-2 text-xs">
					<AspectRatio className="mr-1 h-3 w-3" />
					<span className="w-[28px] text-right">{aspectRatio}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-36 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">Aspect Ratio</h4>
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
								<AspectRatioIcon ratio={ratio.label as "16:9" | "9:16" | "1:1"} />
								{ratio.label}
							</Button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

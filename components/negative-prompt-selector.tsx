"use client";

import { Ban } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NegativePromptSelectorProps {
	negativePrompt: string;
	onChange: (negativePrompt: string) => void;
	maxLength: number;
}

export function NegativePromptSelector({
	negativePrompt,
	onChange,
	maxLength,
}: NegativePromptSelectorProps) {
	const [open, setOpen] = useState(false);
	const [localNegativePrompt, setLocalNegativePrompt] = useState(negativePrompt);

	const handleNegativePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		if (newValue.length <= maxLength) {
			setLocalNegativePrompt(newValue);
		}
	};

	const handleApply = () => {
		onChange(localNegativePrompt);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<Ban className="mr-1 h-3 w-3" />
					{localNegativePrompt ? "Set" : "None"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-4">
					<h4 className="font-medium leading-none">Negative Prompt</h4>
					<div className="space-y-2">
						<Label htmlFor="negative-prompt">
							Describe what you don't want in the video (max {maxLength} chars)
						</Label>
						<Input
							id="negative-prompt"
							value={localNegativePrompt}
							onChange={handleNegativePromptChange}
							placeholder="Enter negative prompt..."
							maxLength={maxLength}
						/>
						<div className="text-xs text-muted-foreground text-right">
							{localNegativePrompt.length} / {maxLength}
						</div>
					</div>
					<Button onClick={handleApply}>Apply</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

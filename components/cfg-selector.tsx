"use client";

import { Scale } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface CfgSelectorProps {
	cfg: number;
	onChange: (cfg: number) => void;
	min: number;
	max: number;
}

export function CfgSelector({ cfg, onChange, min, max }: CfgSelectorProps) {
	const [open, setOpen] = useState(false);

	const handleCfgChange = (value: number[]) => {
		onChange(value[0]);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 w-[60px] px-2 text-xs">
					<Scale className="mr-1 h-3 w-3" />
					<span className="w-[20px] text-right">{cfg.toFixed(1)}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-2">
					<h4 className="font-medium leading-none">CFG</h4>
					<p className="text-sm text-muted-foreground">
						Higher values make the video match the prompt more closely.
					</p>
					<div className="grid grid-cols-[32px_1fr_32px] gap-2 items-center">
						<div className="text-xs text-muted-foreground text-right">{min}</div>
						<Slider
							min={min}
							max={max}
							step={0.1}
							value={[cfg]}
							onValueChange={handleCfgChange}
							className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
							aria-label="CFG"
						/>
						<div className="text-xs text-muted-foreground">{max}</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

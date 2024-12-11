"use client";

import { Dices } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

interface SeedSelectorProps {
	seed: number;
	isRandomSeed: boolean;
	onChange: (seed: number, isRandom: boolean) => void;
}

export function SeedSelector({ seed, isRandomSeed, onChange }: SeedSelectorProps) {
	const [open, setOpen] = useState(false);
	const [localSeed, setLocalSeed] = useState(seed);
	const [localIsRandom, setLocalIsRandom] = useState(isRandomSeed);

	const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSeed = parseInt(e.target.value);
		setLocalSeed(isNaN(newSeed) ? 0 : newSeed);
	};

	const handleRandomToggle = (checked: boolean) => {
		setLocalIsRandom(checked);
		if (checked) {
			setLocalSeed(Math.floor(Math.random() * 1000000));
		}
	};

	const handleApply = () => {
		onChange(localSeed, localIsRandom);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="h-8 px-2 text-xs">
					<Dices className="mr-1 h-3 w-3" />
					{isRandomSeed ? "Random" : seed}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 popover-content">
				<div className="space-y-4">
					<h4 className="font-medium leading-none">Seed</h4>
					<div className="flex items-center space-x-2">
						<Switch
							id="random-mode"
							checked={localIsRandom}
							onCheckedChange={handleRandomToggle}
						/>
						<Label htmlFor="random-mode">Random</Label>
					</div>
					<div className="space-y-2">
						<Label htmlFor="seed">Seed value</Label>
						<Input
							id="seed"
							type="number"
							value={localSeed}
							onChange={handleSeedChange}
							disabled={localIsRandom}
						/>
					</div>
					<Button onClick={handleApply}>Apply</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
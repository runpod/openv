"use client";

import { useUser } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import config from "@/config";

export default function Account() {
	let user = null;
	/* eslint-disable react-hooks/rules-of-hooks */
	if (config?.auth?.enabled) {
		user = useUser();
	}
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex justify-start items-center flex-wrap px-4 pt-5 gap-4">
			<div className="flex flex-col gap-3 mb-[5rem] w-full max-w-[700px]">
				<h2 className="mt-10 scroll-m-20 border-b pb-2 w-full text-3xl font-semibold tracking-tight transition-colors first:mt-0">
					My Profile
				</h2>
				<div className="flex w-full gap-3 mt-3">
					<div className="flex flex-col gap-3 w-full">
						<Label>First Name</Label>
						<Input
							disabled
							defaultValue={user?.user?.firstName ? user?.user?.firstName : ""}
						/>
					</div>
					<div className="flex flex-col gap-3 w-full">
						<Label>Last Name</Label>
						<Input
							disabled
							defaultValue={user?.user?.lastName ? user?.user?.lastName : ""}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-3">
						<Label>E-mail</Label>
						<Input
							disabled
							defaultValue={user?.user?.emailAddresses?.[0]?.emailAddress!}
						/>
					</div>
				</div>

				<h2 className="mt-10 scroll-m-20 border-b pb-2 w-full text-3xl font-semibold tracking-tight transition-colors">
					Appearance
				</h2>
				<div className="flex flex-col gap-3">
					<Label>Theme</Label>
					<Select value={theme} onValueChange={setTheme}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select a theme" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="light">
								<div className="flex items-center gap-2">
									<Sun className="h-4 w-4" />
									Light
								</div>
							</SelectItem>
							<SelectItem value="dark">
								<div className="flex items-center gap-2">
									<Moon className="h-4 w-4" />
									Dark
								</div>
							</SelectItem>
							<SelectItem value="system">System</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}

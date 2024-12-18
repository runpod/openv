"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function AccessRestricted() {
	const router = useRouter();

	return (
		<Alert className="bg-purple-500/10 border-purple-500/50 dark:bg-purple-950/20">
			<Sparkles className="h-4 w-4 text-purple-500" />
			<AlertTitle className="text-purple-500">Video Generation Locked</AlertTitle>
			<AlertDescription className="mt-2 flex flex-col gap-4">
				<div className="space-y-2">
					<p>
						OpenV is free to use for contestants of the AI Film Competition "Project
						Odyssey". Follow these steps to get started:
					</p>
					<ol className="list-decimal list-inside space-y-1">
						<li>
							Get your voucher from{" "}
							<a
								href="https://www.projectodyssey.ai"
								target="_blank"
								rel="noopener noreferrer"
								className="underline hover:text-purple-400"
							>
								projectodyssey.ai
							</a>
						</li>
						<li>Go to your account and apply the voucher</li>
					</ol>
				</div>
				<Button
					variant="outline"
					onClick={() => router.push("/account")}
					className="w-fit border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
				>
					Go to Account
				</Button>
			</AlertDescription>
		</Alert>
	);
}

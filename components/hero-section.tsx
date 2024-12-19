"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ShineBorder from "@/components/ui/shine-border";
import config from "@/config";

export default function HeroSection() {
	let userId = null;
	/* eslint-disable react-hooks/rules-of-hooks */
	if (config?.auth?.enabled) {
		const { userId: authUserId } = useAuth();
		userId = authUserId;
	}

	return (
		<section
			className="flex flex-col items-center justify-center leading-6 mt-[3rem] px-4"
			aria-label="OpenV Hero"
		>
			<h1 className="scroll-m-20 text-6xl font-bold tracking-tight leading-[1.72] text-center sm:text-7xl md:text-8xl lg:text-9xl">
				<span className="relative p-4">
					Generate videos using <br />
					<span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent relative">
						open source AI models
					</span>
				</span>
			</h1>

			<div className="flex flex-col items-center">
				<span className="relative mt-10 p-4">
					<div className="relative">
						<Link href="/my-videos">
							<ShineBorder
								color={["#fff", "#a855f7", "#fff", "#a855f7"]}
								borderWidth={10}
								className="rounded-xl"
							>
								<Button size={null} className="px-8 py-6 font-semibold text-4xl">
									Try for free*
								</Button>
							</ShineBorder>
						</Link>
					</div>
				</span>
				<p className="text-sm text-muted-foreground mt-4">
					*free for{" "}
					<a
						href="https://www.projectodyssey.ai/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-foreground transition-colors"
					>
						Project Odyssey
					</a>{" "}
					Contestants in collab with{" "}
					<a
						href="https://civitai.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="underline hover:text-foreground transition-colors"
					>
						CivitAI
					</a>
				</p>
			</div>
		</section>
	);
}

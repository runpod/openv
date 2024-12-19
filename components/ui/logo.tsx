"use client";

import Link from "next/link";

export function Logo() {
	return (
		<Link href="/" className="flex items-center" aria-label="Home">
			<div className="relative">
				<span className="text-4xl font-light">OpenV</span>
				<span className="absolute -right-1 -bottom-6 text-[10px] text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20">
					public beta
				</span>
				<span className="sr-only">Home</span>
			</div>
		</Link>
	);
}

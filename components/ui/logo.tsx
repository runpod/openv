"use client";

import Link from "next/link";

export function Logo() {
	return (
		<Link href="/" className="flex items-center" aria-label="Home">
			<span className="text-4xl font-light">OpenV</span>
			<span className="sr-only">Home</span>
		</Link>
	);
}

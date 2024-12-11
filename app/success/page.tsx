import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function SuccessPage(props: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return (
		<main className="flex min-w-screen flex-col items-center justify-between">
			<h1 className="mt-[35vh] mb-3 scroll-m-20  text-5xl font-semibold tracking-tight transition-colors first:mt-0">
				Welcome to OpenV
			</h1>
			<Link href="/generate" className="mt-4">
				<Button>Generate</Button>
			</Link>
		</main>
	);
}

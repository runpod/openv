import fs from "fs";
import Markdown from "markdown-to-jsx";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import path from "path";

import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
	title: "Terms of Use - OpenV",
	description: "OpenV Terms of Use Agreement",
};

// Cache the markdown content for 24 hours
const getTermsContent = unstable_cache(
	async () => {
		const filePath = path.join(process.cwd(), "app/terms/terms.md");
		const content = await fs.promises.readFile(filePath, "utf8");
		return content;
	},
	["terms-content"],
	{
		revalidate: 1,
		tags: ["terms"],
	}
);

export default async function TermsPage() {
	const content = await getTermsContent();

	return (
		<MainLayout>
			<div className="container mx-auto px-4 py-20 max-w-4xl">
				<article className="prose-headings:scroll-m-20 prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-12 prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-4">
					<Markdown>{content}</Markdown>
				</article>
			</div>
		</MainLayout>
	);
}

import fs from "fs";
import Markdown from "markdown-to-jsx";
import { redirect } from "next/navigation";
import path from "path";

import { MainLayout } from "@/components/layout/main-layout";
import { AcceptTermsForm } from "@/components/terms/accept-terms-form";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { checkTermsAcceptance } from "@/lib/terms";

// Reuse the same terms content loading function
async function getTermsContent() {
	const filePath = path.join(process.cwd(), "app/terms/terms.md");
	const content = await fs.promises.readFile(filePath, "utf8");
	return content;
}

export default async function AcceptTermsPage() {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	// Check if user has already accepted current version
	const { hasAccepted } = await checkTermsAcceptance(userId);
	if (hasAccepted) {
		redirect("/my-videos");
	}

	const content = await getTermsContent();

	return (
		<MainLayout>
			<div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 max-w-4xl">
				<Card className="w-full">
					<div className="space-y-4 p-6">
						<h1 className="text-2xl font-bold">Accept Terms of Use Agreement</h1>
						<p className="text-muted-foreground">
							Please read and accept our Terms of Use Agreement to continue using
							OpenV.
						</p>
						<div className="h-[calc(100vh-24rem)] overflow-y-auto border rounded-md p-4">
							<article className="prose-headings:scroll-m-20 prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-12 prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4 prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-4">
								<Markdown>{content}</Markdown>
							</article>
						</div>
						<AcceptTermsForm />
					</div>
				</Card>
			</div>
		</MainLayout>
	);
}

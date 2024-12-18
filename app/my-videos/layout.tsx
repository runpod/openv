import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { MyVideosProvider } from "@/app/my-videos/provider";
import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import prisma from "@/lib/prisma";
import { checkTermsAcceptance } from "@/lib/terms";

// Add a delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function MyVideosLayout({ children }: { children: React.ReactNode }) {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
	}

	// Check terms acceptance with retries
	let attempts = 0;
	let hasAccepted = false;
	let error = null;

	while (attempts < 3 && !hasAccepted) {
		const result = await checkTermsAcceptance(userId);
		hasAccepted = result.hasAccepted;
		error = result.error;

		if (!hasAccepted) {
			await delay(1000); // Wait 1 second between attempts
			attempts++;
		}
	}

	if (!hasAccepted) {
		redirect("/terms/accept");
	}

	const user = await prisma.user.findUnique({
		where: { user_id: userId },
	});

	const hasAccess = user?.role === UserRole.user;

	return (
		<AuthenticatedLayout>
			<MyVideosProvider hasAccess={hasAccess}>{children}</MyVideosProvider>
		</AuthenticatedLayout>
	);
}

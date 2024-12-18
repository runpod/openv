import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import prisma from "@/lib/prisma";
import { checkTermsAcceptance } from "@/lib/terms";

import { MyVideosProvider } from "./provider";

export default async function MyVideosLayout({ children }: { children: React.ReactNode }) {
	const { userId } = await auth();
	if (!userId) {
		console.log("[MyVideosLayout] No userId, redirecting to sign-in");
		redirect("/sign-in");
	}

	// Check terms acceptance
	console.log("[MyVideosLayout] Checking terms acceptance for userId:", userId);
	const { hasAccepted, error } = await checkTermsAcceptance(userId);
	console.log("[MyVideosLayout] Terms check result:", { hasAccepted, error });

	if (!hasAccepted) {
		console.log("[MyVideosLayout] Terms not accepted, redirecting to terms/accept");
		redirect("/terms/accept");
	}

	const user = await prisma.user.findUnique({
		where: { user_id: userId },
	});

	const hasAccess = user?.role === UserRole.user;
	console.log("[MyVideosLayout] User access check:", { hasAccess, role: user?.role });

	return (
		<AuthenticatedLayout>
			<MyVideosProvider hasAccess={hasAccess}>{children}</MyVideosProvider>
		</AuthenticatedLayout>
	);
}

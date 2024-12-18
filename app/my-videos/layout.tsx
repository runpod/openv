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
		redirect("/sign-in");
	}

	// Check terms acceptance
	const { hasAccepted } = await checkTermsAcceptance(userId);
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

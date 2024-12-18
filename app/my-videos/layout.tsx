import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import AuthenticatedLayout from "@/components/layout/authenticated-layout";
import prisma from "@/lib/prisma";

import { MyVideosProvider } from "./provider";

export default async function MyVideosLayout({ children }: { children: React.ReactNode }) {
	const { userId } = await auth();
	if (!userId) {
		redirect("/sign-in");
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

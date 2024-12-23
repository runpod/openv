import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VoucherForm } from "@/components/voucher-form";
import prisma from "@/lib/prisma";

export default async function AccountPage() {
	const { userId } = await auth();
	const user = await currentUser();

	if (!userId || !user) {
		redirect("/sign-in");
	}

	// Get user status from database
	const dbUser = await prisma.user.findUnique({
		where: { user_id: userId },
		select: {
			role: true,
			voucher_used: true,
			voucher_used_at: true,
			monthlyUsage: true,
		},
	});

	// Get voucher details if user has one
	let voucherDetails = null;
	if (dbUser?.voucher_used) {
		voucherDetails = await prisma.voucher.findUnique({
			where: { code: dbUser.voucher_used },
		});
	}

	// Get monthly limit from env
	const monthlyLimitSeconds = parseInt(process.env.MONTHLY_LIMIT_SECONDS || "60", 10);
	const currentUsage = dbUser?.monthlyUsage || 0;
	const usagePercentage = (currentUsage / monthlyLimitSeconds) * 100;
	const remainingSeconds = monthlyLimitSeconds - currentUsage;

	// Prepare status for the client component
	const status = {
		role: dbUser?.role || UserRole.restricted,
		voucher_used: dbUser?.voucher_used || null,
		voucher_used_at: dbUser?.voucher_used_at?.toISOString() || null,
		voucher_details: voucherDetails
			? {
					code: voucherDetails.code,
					expiresAt: voucherDetails.expiresAt.toISOString(),
					isActive: voucherDetails.isActive,
				}
			: null,
	};

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="max-w-2xl mx-auto space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>Your personal information</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium">Name</p>
								<p className="text-sm text-muted-foreground">
									{user.firstName} {user.lastName}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">Email</p>
								<p className="text-sm text-muted-foreground">
									{user.emailAddresses[0]?.emailAddress}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">Account Created</p>
								<p className="text-sm text-muted-foreground">
									{user.createdAt
										? new Date(user.createdAt).toLocaleDateString()
										: "N/A"}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">Account Status</p>
								<p className="text-sm text-muted-foreground">
									{status.role === UserRole.user ? "Active" : "Restricted"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{status.role === UserRole.user && (
					<Card>
						<CardHeader>
							<CardTitle>Monthly Usage</CardTitle>
							<CardDescription>Your video generation quota</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										{currentUsage.toFixed(2)} / {monthlyLimitSeconds} seconds
										used
									</span>
									<span className="text-muted-foreground">
										{remainingSeconds.toFixed(2)} seconds remaining
									</span>
								</div>
								<Progress value={usagePercentage} className="h-2" />
							</div>
						</CardContent>
					</Card>
				)}

				<VoucherForm initialStatus={status} />
			</div>
		</div>
	);
}

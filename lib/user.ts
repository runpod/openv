import { UserRole } from "@prisma/client";

import { checkMonthlyLimit, incrementMonthlyUsage } from "@/lib/monthly-limit";
import prisma from "@/lib/prisma";

export interface UserStatus {
	role: UserRole;
	voucher_used: string | null;
	voucher_used_at: Date | null;
	voucher_details: {
		code: string;
		expiresAt: Date;
		isActive: boolean;
	} | null;
}

export interface CheckVideoLimitResult {
	allowed: boolean;
	remainingSeconds: number;
	error?: string;
	status?: number;
}

export async function checkUserRole(userId: string, requiredRole: UserRole) {
	const user = await prisma.user.findUnique({
		where: { user_id: userId },
	});

	if (!user) {
		return { error: "User not found", status: 404 };
	}

	if (user.role !== requiredRole) {
		return { error: `This action requires ${requiredRole} role`, status: 403 };
	}

	return { user };
}

export async function checkVideoLimit(
	userId: string,
	durationInSeconds: number
): Promise<CheckVideoLimitResult> {
	const { allowed, remainingSeconds } = await checkMonthlyLimit({
		userId,
		requestedDuration: durationInSeconds,
	});

	if (!allowed) {
		return {
			allowed: false,
			remainingSeconds,
			error: "You have reached your monthly video generation limit.",
			status: 403,
		};
	}

	return { allowed: true, remainingSeconds };
}

export async function incrementVideoUsage(
	userId: string,
	durationInSeconds: number
): Promise<void> {
	await incrementMonthlyUsage(userId, durationInSeconds);
}

export async function getUserStatus(userId: string | null): Promise<UserStatus | null> {
	if (!userId) return null;

	const user = await prisma.user.findUnique({
		where: { user_id: userId },
		select: {
			role: true,
			voucher_used: true,
			voucher_used_at: true,
		},
	});

	if (!user) return null;

	if (user.voucher_used) {
		const voucher = await prisma.voucher.findUnique({
			where: { code: user.voucher_used },
			select: {
				code: true,
				expiresAt: true,
				isActive: true,
			},
		});

		return {
			role: user.role,
			voucher_used: user.voucher_used,
			voucher_used_at: user.voucher_used_at,
			voucher_details: voucher,
		};
	}

	return {
		role: user.role,
		voucher_used: null,
		voucher_used_at: null,
		voucher_details: null,
	};
}

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
	suggestedFrames?: number | null;
}

interface QuotaCheckParams {
	remainingSeconds: number;
	requestedDuration: number;
	possibleLengths: Array<{ frames: number; duration: number }>;
}

export function checkQuotaAllowance({
	remainingSeconds,
	requestedDuration,
	possibleLengths,
}: QuotaCheckParams): { allowed: boolean; suggestedFrames: number | null } {
	// If we have no quota left, don't allow generation
	if (remainingSeconds <= 0) {
		return { allowed: false, suggestedFrames: null };
	}

	// Get the minimum possible duration from the first length
	const minimumDuration = possibleLengths[0].duration;

	// If we have less than the minimum duration remaining, but more than 0,
	// we should still allow generating at the minimum length
	if (remainingSeconds < minimumDuration) {
		// If the requested duration is the minimum duration, allow it
		if (requestedDuration === minimumDuration) {
			return { allowed: true, suggestedFrames: null };
		}
		// Otherwise suggest the minimum duration
		return {
			allowed: false,
			suggestedFrames: possibleLengths[0].frames,
		};
	}

	// Find the length that's just above the remaining quota
	const nextPossibleLength = possibleLengths.find(length => length.duration > remainingSeconds);

	// Find the length that's just below the remaining quota
	const currentPossibleLength = [...possibleLengths]
		.reverse()
		.find(length => length.duration <= remainingSeconds);

	// If we can't find a possible length, don't allow generation
	if (!currentPossibleLength) {
		return { allowed: false, suggestedFrames: null };
	}

	// Find the next length after the current requested duration
	const nextLengthAfterCurrent = possibleLengths.find(
		length => length.duration > requestedDuration
	);

	// If the current video length is:
	// 1. Less than or equal to the current possible length, OR
	// 2. Equal to the next possible length (exact match), OR
	// 3. Between two steps and the next step is within quota
	const isAllowed = !!(
		requestedDuration <= currentPossibleLength.duration ||
		(nextPossibleLength && requestedDuration === nextPossibleLength.duration) ||
		(nextLengthAfterCurrent && nextLengthAfterCurrent.duration <= remainingSeconds)
	);

	return {
		allowed: isAllowed,
		suggestedFrames: isAllowed ? null : currentPossibleLength.frames,
	};
}

export async function checkVideoLimit(
	userId: string,
	durationInSeconds: number,
	fps: number = 24,
	numFramesMin: number = 31,
	numFramesMax: number = 127
): Promise<CheckVideoLimitResult> {
	// Get remaining seconds from monthly limit
	const { remainingSeconds } = await checkMonthlyLimit({
		userId,
		requestedDuration: durationInSeconds,
	});

	// Generate possible lengths
	const possibleLengths = [];
	for (let i = numFramesMin; i <= numFramesMax; i += 6) {
		possibleLengths.push({
			frames: i,
			duration: i / fps,
		});
	}

	// Check if the requested duration is allowed with rounding up
	const { allowed, suggestedFrames } = checkQuotaAllowance({
		remainingSeconds,
		requestedDuration: durationInSeconds,
		possibleLengths,
	});

	if (!allowed) {
		return {
			allowed: false,
			remainingSeconds,
			suggestedFrames,
			error: "You have reached your monthly video generation limit.",
			status: 403,
		};
	}

	return { allowed: true, remainingSeconds, suggestedFrames };
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

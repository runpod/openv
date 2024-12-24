import prisma from "@/lib/prisma";

interface CheckMonthlyLimitParams {
	userId: string;
	requestedDuration: number;
}

interface MonthlyQuota {
	remainingSeconds: number;
	currentUsage: number;
	limitSeconds: number;
}

export async function getMonthlyQuota(userId: string): Promise<MonthlyQuota> {
	const MONTHLY_LIMIT_SECONDS = parseInt(process.env.MONTHLY_LIMIT_SECONDS || "60", 10);
	const LIMIT_START_DATE = process.env.LIMIT_START_DATE
		? new Date(process.env.LIMIT_START_DATE)
		: null;
	const LIMIT_END_DATE = process.env.LIMIT_END_DATE ? new Date(process.env.LIMIT_END_DATE) : null;

	// Get user's current usage
	const user = await prisma.user.findUnique({
		where: { user_id: userId },
		select: { monthlyUsage: true, monthlyUsageLastReset: true },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const now = new Date();
	let shouldReset = false;

	// Check if we're in a custom date range
	if (LIMIT_START_DATE && LIMIT_END_DATE) {
		// Validate that end date is after start date
		if (LIMIT_END_DATE <= LIMIT_START_DATE) {
			console.error("Invalid date range: end date must be after start date");
			// Fall back to standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		} else if (now > LIMIT_END_DATE) {
			// Past the end date - check if we need a one-time reset
			const hasResetAfterEnd =
				user.monthlyUsageLastReset && user.monthlyUsageLastReset > LIMIT_END_DATE;
			if (!hasResetAfterEnd) {
				// Haven't reset since the end date, do it now
				await prisma.user.update({
					where: { user_id: userId },
					data: { monthlyUsage: 0, monthlyUsageLastReset: now },
				});
				return {
					remainingSeconds: MONTHLY_LIMIT_SECONDS,
					currentUsage: 0,
					limitSeconds: MONTHLY_LIMIT_SECONDS,
				};
			}
			// Already reset after end date, use standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		} else if (now >= LIMIT_START_DATE && now <= LIMIT_END_DATE) {
			// We're in the custom range, reset if we haven't reset since range start
			shouldReset =
				!user.monthlyUsageLastReset || user.monthlyUsageLastReset < LIMIT_START_DATE;
		} else {
			// Before the start date, use standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		}
	} else {
		// Standard monthly reset logic
		shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
	}

	// Reset usage if needed
	if (shouldReset) {
		await prisma.user.update({
			where: { user_id: userId },
			data: { monthlyUsage: 0, monthlyUsageLastReset: now },
		});
		return {
			remainingSeconds: MONTHLY_LIMIT_SECONDS,
			currentUsage: 0,
			limitSeconds: MONTHLY_LIMIT_SECONDS,
		};
	}

	const remainingSeconds = MONTHLY_LIMIT_SECONDS - user.monthlyUsage;

	return {
		remainingSeconds,
		currentUsage: user.monthlyUsage,
		limitSeconds: MONTHLY_LIMIT_SECONDS,
	};
}

export async function checkMonthlyLimit({ userId, requestedDuration }: CheckMonthlyLimitParams) {
	const MONTHLY_LIMIT_SECONDS = parseInt(process.env.MONTHLY_LIMIT_SECONDS || "60", 10);
	const LIMIT_START_DATE = process.env.LIMIT_START_DATE
		? new Date(process.env.LIMIT_START_DATE)
		: null;
	const LIMIT_END_DATE = process.env.LIMIT_END_DATE ? new Date(process.env.LIMIT_END_DATE) : null;

	// Get user's current usage
	const user = await prisma.user.findUnique({
		where: { user_id: userId },
		select: { monthlyUsage: true, monthlyUsageLastReset: true },
	});

	if (!user) {
		throw new Error("User not found");
	}

	const now = new Date();
	let shouldReset = false;

	// Check if we're in a custom date range
	if (LIMIT_START_DATE && LIMIT_END_DATE) {
		// Validate that end date is after start date
		if (LIMIT_END_DATE <= LIMIT_START_DATE) {
			console.error("Invalid date range: end date must be after start date");
			// Fall back to standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		} else if (now > LIMIT_END_DATE) {
			// Past the end date - check if we need a one-time reset
			const hasResetAfterEnd =
				user.monthlyUsageLastReset && user.monthlyUsageLastReset > LIMIT_END_DATE;
			if (!hasResetAfterEnd) {
				// Haven't reset since the end date, do it now
				await prisma.user.update({
					where: { user_id: userId },
					data: { monthlyUsage: 0, monthlyUsageLastReset: now },
				});
				return { allowed: true, remainingSeconds: MONTHLY_LIMIT_SECONDS };
			}
			// Already reset after end date, use standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		} else if (now >= LIMIT_START_DATE && now <= LIMIT_END_DATE) {
			// We're in the custom range, reset if we haven't reset since range start
			shouldReset =
				!user.monthlyUsageLastReset || user.monthlyUsageLastReset < LIMIT_START_DATE;
		} else {
			// Before the start date, use standard monthly reset
			shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
		}
	} else {
		// Standard monthly reset logic
		shouldReset = isNewMonth(user.monthlyUsageLastReset, now);
	}

	// Reset usage if needed
	if (shouldReset) {
		await prisma.user.update({
			where: { user_id: userId },
			data: { monthlyUsage: 0, monthlyUsageLastReset: now },
		});
		return { allowed: true, remainingSeconds: MONTHLY_LIMIT_SECONDS };
	}

	// Check if the new request would exceed the limit
	const projectedUsage = user.monthlyUsage + requestedDuration;
	const allowed = projectedUsage <= MONTHLY_LIMIT_SECONDS;
	const remainingSeconds = MONTHLY_LIMIT_SECONDS - user.monthlyUsage;

	return { allowed, remainingSeconds };
}

// Helper to check if we're in a new month
function isNewMonth(lastReset: Date, now: Date): boolean {
	return (
		lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
		lastReset.getUTCMonth() !== now.getUTCMonth()
	);
}

export async function incrementMonthlyUsage(userId: string, duration: number) {
	// Round to 2 decimal places to avoid floating point precision issues
	const roundedDuration = Number(duration.toFixed(2));

	await prisma.user.update({
		where: { user_id: userId },
		data: {
			monthlyUsage: {
				increment: roundedDuration,
			},
		},
	});
}

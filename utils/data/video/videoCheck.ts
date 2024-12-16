import { systemConfig } from "@/lib/models/config";
import prisma from "@/lib/prisma";

export interface ConcurrencyCheck {
	count: number;
	allowed: boolean;
	error?: string;
}

export async function checkConcurrentJobs(userId: string): Promise<ConcurrencyCheck> {
	const activeJobs = await prisma.video.count({
		where: {
			userId,
			status: "queued",
		},
	});

	const allowed = activeJobs < systemConfig.concurrentJobs.max;

	return {
		count: activeJobs,
		allowed,
		error: allowed
			? undefined
			: `You have reached the maximum limit of ${systemConfig.concurrentJobs.max} concurrent jobs. Please wait for your other videos to finish processing.`,
	};
}

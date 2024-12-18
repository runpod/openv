import prisma from "@/lib/prisma";

// Current version of ToS - update this when terms change
export const CURRENT_TOS_VERSION = "1.0.0";

interface CheckTermsResponse {
	hasAccepted: boolean;
	error: string | null;
}

export const checkTermsAcceptance = async (userId: string): Promise<CheckTermsResponse> => {
	try {
		const acceptance = await prisma.terms_acceptance.findFirst({
			where: {
				userId,
				version: CURRENT_TOS_VERSION,
			},
			orderBy: {
				acceptedAt: "desc",
			},
		});

		const hasAccepted = !!acceptance;

		return {
			hasAccepted,
			error: null,
		};
	} catch (error) {
		return {
			hasAccepted: false,
			error: "Failed to check terms acceptance",
		};
	}
};

export async function acceptTerms(
	userId: string
): Promise<{ success: boolean; error: string | null }> {
	try {
		// First check if terms are already accepted
		const existing = await prisma.terms_acceptance.findFirst({
			where: {
				userId,
				version: CURRENT_TOS_VERSION,
			},
		});

		if (existing) {
			return {
				success: true,
				error: null,
			};
		}

		// If not already accepted, create new acceptance
		await prisma.terms_acceptance.create({
			data: {
				userId,
				acceptedAt: new Date(),
				version: CURRENT_TOS_VERSION,
			},
		});

		return {
			success: true,
			error: null,
		};
	} catch (error) {
		console.error("Error accepting terms:", error);
		return {
			success: false,
			error: "Failed to accept terms",
		};
	}
}

export async function getLatestTermsAcceptance(userId: string) {
	return prisma.terms_acceptance.findFirst({
		where: { userId },
		orderBy: { acceptedAt: "desc" },
	});
}

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Current version of ToS - update this when terms change
export const CURRENT_TOS_VERSION = "1.0.0";

interface CheckTermsResponse {
	hasAccepted: boolean;
	error: string | null;
}

export async function checkTermsAcceptance(userId: string): Promise<CheckTermsResponse> {
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

		return {
			hasAccepted: !!acceptance,
			error: null,
		};
	} catch (error) {
		console.error("Error checking terms acceptance:", error);
		return {
			hasAccepted: false,
			error: "Failed to check terms acceptance",
		};
	}
}

export async function acceptTerms(
	userId: string
): Promise<{ success: boolean; error: string | null }> {
	try {
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

// Helper function for middleware to check terms acceptance
export async function checkTermsMiddleware(req: Request) {
	try {
		const response = await fetch(new URL("/api/terms/check", req.url), {
			headers: req.headers,
		});

		if (!response.ok) {
			console.error("Error checking terms acceptance");
			return null;
		}

		const { hasAccepted } = await response.json();

		if (!hasAccepted) {
			// Use 303 See Other to force a new GET request and prevent loops
			return NextResponse.redirect(new URL("/terms/accept", req.url), 303);
		}

		return;
	} catch (error) {
		console.error("Error in terms middleware:", error);
		return null;
	}
}

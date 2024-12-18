import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkTermsAcceptance } from "@/lib/terms";

export async function GET() {
	try {
		console.log("[Terms Check API] Getting auth...");
		const { userId } = await auth();
		console.log("[Terms Check API] Got userId:", userId);

		if (!userId) {
			console.log("[Terms Check API] No userId, returning unauthorized");
			return NextResponse.json(
				{ hasAccepted: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		console.log("[Terms Check API] Checking terms acceptance...");
		const { hasAccepted, error } = await checkTermsAcceptance(userId);
		console.log("[Terms Check API] Terms check result:", { hasAccepted, error });

		if (error) {
			console.log("[Terms Check API] Error checking terms:", error);
			return NextResponse.json({ hasAccepted: false, error }, { status: 500 });
		}

		return NextResponse.json({ hasAccepted });
	} catch (error) {
		console.error("[Terms Check API] Error:", error);
		return NextResponse.json(
			{ hasAccepted: false, error: "Failed to check terms acceptance" },
			{ status: 500 }
		);
	}
}

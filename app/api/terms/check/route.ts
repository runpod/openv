import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkTermsAcceptance } from "@/lib/terms";

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ hasAccepted: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { hasAccepted, error } = await checkTermsAcceptance(userId);
		if (error) {
			return NextResponse.json({ hasAccepted: false, error }, { status: 500 });
		}

		return NextResponse.json({ hasAccepted });
	} catch (error) {
		console.error("Error checking terms acceptance:", error);
		return NextResponse.json(
			{ hasAccepted: false, error: "Failed to check terms acceptance" },
			{ status: 500 }
		);
	}
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkTermsAcceptance } from "@/lib/terms";

export async function GET() {
	try {
		const authResult = await auth();
		const { userId } = authResult;

		const { hasAccepted } = await checkTermsAcceptance(userId);

		return NextResponse.json({ hasAccepted });
	} catch (error) {
		console.error("Error checking terms acceptance:", error);
		return NextResponse.json({ hasAccepted: false }, { status: 500 });
	}
}

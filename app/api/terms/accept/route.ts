import { NextResponse } from "next/server";

import { auth, requireAuth } from "@/lib/auth";
import { acceptTerms } from "@/lib/terms";

export async function POST(request: Request) {
	try {
		const authResult = await auth();
		requireAuth(authResult);
		const { userId } = authResult;

		await acceptTerms(userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error accepting terms:", error);
		return NextResponse.json({ error: "Failed to accept terms" }, { status: 500 });
	}
}

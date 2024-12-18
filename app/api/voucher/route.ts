import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkUserRole } from "@/lib/user";

// Admin creates a voucher
export async function POST(request: Request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// Check if user is admin
		const roleCheck = await checkUserRole(userId, UserRole.admin);
		if ("error" in roleCheck) {
			return NextResponse.json({ message: roleCheck.error }, { status: roleCheck.status });
		}

		const { code } = await request.json();
		if (!code) {
			return NextResponse.json({ message: "Voucher code is required" }, { status: 400 });
		}

		// Create voucher with 30 days expiration
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);

		const voucher = await prisma.voucher.create({
			data: {
				code,
				expiresAt,
				createdBy: userId,
			},
		});

		return NextResponse.json(voucher);
	} catch (error) {
		console.error("Voucher creation error:", error);
		return NextResponse.json({ message: "Failed to create voucher" }, { status: 500 });
	}
}

// User applies a voucher
export async function PUT(request: Request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const { code } = await request.json();
		if (!code) {
			return NextResponse.json({ message: "Voucher code is required" }, { status: 400 });
		}

		// Get current user to check existing voucher
		const existingUser = await prisma.user.findUnique({
			where: { user_id: userId },
		});

		if (existingUser?.voucher_used === code) {
			return NextResponse.json(
				{ message: "You have already used this voucher code" },
				{ status: 400 }
			);
		}

		// Check if voucher exists and is valid
		const voucher = await prisma.voucher.findUnique({
			where: { code },
		});

		if (!voucher) {
			return NextResponse.json({ message: "Invalid voucher code" }, { status: 400 });
		}

		if (!voucher.isActive) {
			return NextResponse.json({ message: "Voucher is inactive" }, { status: 400 });
		}

		const now = new Date();
		if (now > voucher.expiresAt) {
			await prisma.voucher.update({
				where: { id: voucher.id },
				data: { isActive: false },
			});
			return NextResponse.json({ message: "Voucher has expired" }, { status: 400 });
		}

		// Update user role and record voucher usage
		const updatedUser = await prisma.user.update({
			where: { user_id: userId },
			data: {
				role: UserRole.user,
				voucher_used: code,
				voucher_used_at: now,
			},
		});

		return NextResponse.json({
			message: "Voucher applied successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Voucher application error:", error);
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return NextResponse.json({ message: "Invalid voucher code" }, { status: 400 });
			}
			return NextResponse.json({ message: error.message }, { status: 400 });
		}
		return NextResponse.json({ message: "Failed to apply voucher" }, { status: 500 });
	}
}

// Get user's voucher status
export async function GET(request: Request) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { user_id: userId },
		});

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// If user has used a voucher, get the voucher details
		if (user.voucher_used) {
			const voucher = await prisma.voucher.findUnique({
				where: { code: user.voucher_used },
			});

			return NextResponse.json({
				role: user.role,
				voucher_used: user.voucher_used,
				voucher_used_at: user.voucher_used_at,
				voucher_details: voucher,
			});
		}

		return NextResponse.json({
			role: user.role,
			voucher_used: null,
			voucher_used_at: null,
			voucher_details: null,
		});
	} catch (error) {
		console.error("Voucher status fetch error:", error);
		return NextResponse.json({ message: "Failed to fetch voucher status" }, { status: 500 });
	}
}

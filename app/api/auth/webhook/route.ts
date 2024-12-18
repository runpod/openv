import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { userCreate } from "@/utils/data/user/userCreate";
import { userUpdate } from "@/utils/data/user/userUpdate";

export async function POST(req: Request) {
	console.log("[Clerk Webhook] Received request");

	// You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		console.error("[Clerk Webhook] Missing WEBHOOK_SECRET");
		throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
	}

	// Get the headers
	const headerPayload = await headers();
	const svix_id = headerPayload.get("svix-id");
	const svix_timestamp = headerPayload.get("svix-timestamp");
	const svix_signature = headerPayload.get("svix-signature");

	console.log("[Clerk Webhook] Headers:", {
		"svix-id": svix_id,
		"svix-timestamp": svix_timestamp,
		"svix-signature": svix_signature?.slice(0, 10) + "...", // Log only part of the signature for security
	});

	// If there are no headers, error out
	if (!svix_id || !svix_timestamp || !svix_signature) {
		console.error("[Clerk Webhook] Missing required headers");
		return new Response("Error occured -- no svix headers", {
			status: 400,
		});
	}

	// Get the body
	const payload = await req.json();
	console.log("[Clerk Webhook] Received payload:", {
		type: payload?.type,
		data: {
			id: payload?.data?.id,
			email: payload?.data?.email_addresses?.[0]?.email_address,
			first_name: payload?.data?.first_name,
			last_name: payload?.data?.last_name,
		},
	});

	const body = JSON.stringify(payload);

	// Create a new SVIX instance with your secret.
	const wh = new Webhook(WEBHOOK_SECRET);

	let evt: WebhookEvent;

	// Verify the payload with the headers
	try {
		evt = wh.verify(body, {
			"svix-id": svix_id,
			"svix-timestamp": svix_timestamp,
			"svix-signature": svix_signature,
		}) as WebhookEvent;
	} catch (err) {
		console.error("[Clerk Webhook] Verification failed:", err);
		return new Response("Error occured", {
			status: 400,
		});
	}

	// Get the ID and type
	const { id } = evt.data;
	const eventType = evt.type;

	console.log("[Clerk Webhook] Processing event:", { id, eventType });

	switch (eventType) {
		case "user.created":
			try {
				console.log("[Clerk Webhook] Creating user:", payload?.data?.id);
				const result = await userCreate({
					email: payload?.data?.email_addresses?.[0]?.email_address,
					first_name: payload?.data?.first_name,
					last_name: payload?.data?.last_name,
					profile_image_url: payload?.data?.profile_image_url,
					user_id: payload?.data?.id,
				});

				// If result has a code property, it's an error
				if ("code" in result) {
					console.error("[Clerk Webhook] Error creating user:", result);
					return NextResponse.json({
						status: 400,
						message: result.message || "Error creating user",
					});
				}

				console.log("[Clerk Webhook] User created/found:", result);

				return NextResponse.json({
					status: 200,
					message: "User info processed",
					result,
				});
			} catch (error: any) {
				console.error("[Clerk Webhook] Error creating user:", error);
				return NextResponse.json({
					status: 400,
					message: error.message,
				});
			}

		case "user.updated":
			try {
				console.log("[Clerk Webhook] Updating user:", payload?.data?.id);
				const result = await userUpdate({
					email: payload?.data?.email_addresses?.[0]?.email_address,
					first_name: payload?.data?.first_name,
					last_name: payload?.data?.last_name,
					profile_image_url: payload?.data?.profile_image_url,
					user_id: payload?.data?.id,
				});
				console.log("[Clerk Webhook] User updated:", result);

				return NextResponse.json({
					status: 200,
					message: "User info updated",
					result,
				});
			} catch (error: any) {
				console.error("[Clerk Webhook] Error updating user:", error);
				return NextResponse.json({
					status: 400,
					message: error.message,
				});
			}

		default:
			console.log("[Clerk Webhook] Unhandled event type:", eventType);
			return new Response("Error occured -- unhandeled event type", {
				status: 400,
			});
	}
}

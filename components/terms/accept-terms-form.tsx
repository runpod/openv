"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

export function AcceptTermsForm() {
	const { toast } = useToast();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Accept terms
			const response = await fetch("/api/terms/accept", {
				method: "POST",
				cache: "no-store",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to accept terms");
			}

			// Wait for the terms to be accepted and verified
			let attempts = 0;
			let isVerified = false;

			while (attempts < 3 && !isVerified) {
				await new Promise(resolve => setTimeout(resolve, 1000));

				const verifyResponse = await fetch("/api/terms/check", {
					cache: "no-store",
				});
				const verifyData = await verifyResponse.json();

				if (verifyData.hasAccepted) {
					isVerified = true;
					break;
				}

				attempts++;
			}

			if (!isVerified) {
				throw new Error("Terms acceptance verification failed after multiple attempts");
			}

			// Force a hard redirect to clear all caches
			window.location.href = "/my-videos";
		} catch (error) {
			setIsSubmitting(false);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to accept terms. Please try again.",
				variant: "destructive",
			});
		}
	}

	return (
		<>
			<form onSubmit={onSubmit} className="flex gap-4">
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={() => router.push("/")}
				>
					Decline & Return Home
				</Button>
				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}I
					Accept the Terms of Use Agreement
				</Button>
			</form>
			<Toaster />
		</>
	);
}

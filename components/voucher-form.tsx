"use client";

import { UserRole } from "@prisma/client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface VoucherStatus {
	role: UserRole;
	voucher_used: string | null;
	voucher_used_at: string | null;
	voucher_details: {
		code: string;
		expiresAt: string;
		isActive: boolean;
	} | null;
}

interface VoucherFormProps {
	initialStatus: VoucherStatus;
}

export function VoucherForm({ initialStatus }: VoucherFormProps) {
	const router = useRouter();
	const [status, setStatus] = useState<VoucherStatus>(initialStatus);
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/voucher", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code }),
			});

			const data = await response.json();

			if (!response.ok) {
				let errorMessage;
				switch (data.message) {
					case "Invalid voucher code":
						errorMessage = "This voucher code doesn't exist";
						break;
					case "Voucher is inactive":
						errorMessage = "This voucher is no longer active";
						break;
					case "Voucher has expired":
						errorMessage = "This voucher has expired";
						break;
					case "You have already used this voucher code":
						errorMessage = "You have already used this voucher code";
						break;
					default:
						errorMessage = "Failed to apply voucher. Please try again.";
				}
				throw new Error(errorMessage);
			}

			// Update local state with the server response
			const newStatus: VoucherStatus = {
				role: UserRole.user,
				voucher_used: code,
				voucher_used_at: new Date().toISOString(),
				voucher_details: {
					code: code,
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
					isActive: true,
				},
			};
			setStatus(newStatus);
			setCode("");
			setSuccess("Voucher applied successfully! You now have access to video generation.");

			// Refresh the router to update server data
			router.refresh();
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Voucher</CardTitle>
				<CardDescription>Enter your voucher code to enable access to OpenV</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{status.voucher_used && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm font-medium">Current Voucher</p>
								<p className="text-sm text-muted-foreground">
									{status.voucher_used}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium">Applied On</p>
								<p className="text-sm text-muted-foreground">
									{status.voucher_used_at
										? new Date(status.voucher_used_at).toLocaleDateString()
										: "N/A"}
								</p>
							</div>
						</div>
					)}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Input
								placeholder="Enter voucher code"
								value={code}
								onChange={e => {
									setCode(e.target.value);
									setError(null);
									setSuccess(null);
								}}
								disabled={isLoading}
								aria-invalid={!!error}
								className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
							/>
							{error && <p className="text-sm text-red-500">{error}</p>}
							{success && (
								<p className="text-sm text-green-500 flex items-center gap-1.5">
									<Check className="h-4 w-4" />
									{success}
								</p>
							)}
						</div>
						<Button type="submit" disabled={isLoading || !code}>
							{isLoading ? "Applying..." : "Apply"}
						</Button>
					</form>
				</div>
			</CardContent>
		</Card>
	);
}

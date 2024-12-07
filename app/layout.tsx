import "@fontsource/inter";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import Provider from "@/app/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://starter.rasmic.xyz"),
	title: {
		default: "Nextjs Starter Kit",
		template: `%s | Nextjs Starter Kit`,
	},
	description:
		"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
	openGraph: {
		description:
			"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
		images: ["https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png"],
		url: "https://starter.rasmic.xyz/",
	},
	twitter: {
		card: "summary_large_image",
		title: "Nextjs Starter Kit",
		description:
			"The Ultimate Nextjs 14 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
		siteId: "",
		creator: "@rasmic",
		creatorId: "",
		images: ["https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png"],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="preload"
					href="https://utfs.io/f/31dba2ff-6c3b-4927-99cd-b928eaa54d5f-5w20ij.png"
					as="image"
				/>
				<link
					rel="preload"
					href="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
					as="image"
				/>
			</head>
			<body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
				<ClerkProvider>
					<Provider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							{children}
							<Toaster />
						</ThemeProvider>
					</Provider>
				</ClerkProvider>
				<Analytics />
			</body>
		</html>
	);
}

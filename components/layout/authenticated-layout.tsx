"use client";

import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="h-screen flex w-full">
				<NavigationSidebar />
				<main className="flex-1">
					<div className="fixed top-0 left-0 z-50">
						<SidebarTrigger className="size-8 bg-secondary p-1" />
					</div>
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
}

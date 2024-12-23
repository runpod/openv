"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Bug, Folder, Github, HomeIcon, LogOut, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation items
const mainNavItems = [
	{
		title: "My Videos",
		url: "/my-videos",
		icon: HomeIcon,
	},
	{
		title: "Inspiration",
		url: "/inspiration",
		icon: Folder,
	},
];

const externalNavItems = [
	{
		title: "Source",
		url: "https://github.com/runpod/openv",
		icon: Github,
		external: true,
	},
	{
		title: "Feedback",
		url: "https://github.com/runpod/openv/discussions",
		icon: MessageCircle,
		external: true,
	},
	{
		title: "Report Bug",
		url: "https://github.com/runpod/openv/issues",
		icon: Bug,
		external: true,
	},
];

export function NavigationSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<div className="mb-6 mt-12 flex justify-center">
						<Logo />
					</div>
				</SidebarGroup>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavItems.map(item => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className={
											pathname === item.url
												? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
												: ""
										}
									>
										<Link href={item.url}>
											<div className="flex items-center gap-2">
												<div
													className={
														pathname === item.url
															? "border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white"
															: "border rounded-lg border-gray-400 dark:border-gray-700 p-1"
													}
												>
													<item.icon className="h-3 w-3" />
												</div>
												<span>{item.title}</span>
											</div>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							<div className="px-3 py-2">
								<Separator />
							</div>
							{externalNavItems.map(item => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a
											href={item.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2"
										>
											<div className="border rounded-lg border-gray-400 dark:border-gray-700 p-1">
												<item.icon className="h-3 w-3" />
											</div>
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* User Section */}
				<SidebarGroup className="mt-auto">
					<SidebarGroupContent>
						{/* Account Menu */}
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className={
										pathname === "/account"
											? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
											: "text-gray-600 dark:text-gray-400"
									}
								>
									<Link href="/account">
										<div className="flex items-center gap-2">
											<div
												className={
													pathname === "/account"
														? "border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white"
														: "border rounded-lg border-gray-400 dark:border-gray-700 p-1 bg-transparent"
												}
											>
												<User className="h-3 w-3" />
											</div>
											<span>Account</span>
										</div>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									className="text-gray-600 dark:text-gray-400"
								>
									<SignOutButton>
										<button className="flex w-full items-center gap-2">
											<div className="border rounded-lg border-gray-400 dark:border-gray-700 p-1 bg-transparent">
												<LogOut className="h-3 w-3" />
											</div>
											<span>Sign Out</span>
										</button>
									</SignOutButton>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

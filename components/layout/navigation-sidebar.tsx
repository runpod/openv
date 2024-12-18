"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { Folder, HomeIcon, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation items
const navigationItems = [
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

export function NavigationSidebar() {
	const pathname = usePathname();
	const { user } = useUser();

	return (
		<Sidebar collapsible="icon">
			<SidebarContent>
				<div className="mb-6 mt-12 flex justify-center">
					<Logo />
				</div>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map(item => (
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
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* User Section */}
				<SidebarGroup className="mt-auto">
					<SidebarGroupLabel>Account</SidebarGroupLabel>
					<SidebarGroupContent>
						{/* User Info */}
						<div className="px-3 mb-2">
							<div className="flex items-center gap-2">
								<Avatar className="h-8 w-8">
									<AvatarImage src={user?.imageUrl} />
									<AvatarFallback>
										{user?.firstName?.charAt(0)}
										{user?.lastName?.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="text-sm font-medium">
										{user?.firstName} {user?.lastName}
									</span>
								</div>
							</div>
						</div>

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

"use client";
import { useAuth } from "@clerk/nextjs";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import Link from "next/link";
import * as React from "react";
import { GiHamburgerMenu } from "react-icons/gi";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import config from "@/config";

import ModeToggle from "../mode-toggle";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { UserProfile } from "../user-profile";

export default function NavBar() {
	let userId = null;
	/* eslint-disable react-hooks/rules-of-hooks */
	if (config?.auth?.enabled) {
		const { userId: authUserId } = useAuth();
		userId = authUserId;
	}

	return (
		<div className="flex min-w-full fixed justify-between p-2 border-b z-10 dark:bg-black dark:bg-opacity-50 bg-white">
			<div className="flex justify-between w-full min-[825px]:hidden">
				<Dialog>
					<SheetTrigger className="p-2 transition">
						<Button
							size="icon"
							variant="ghost"
							className="w-4 h-4"
							aria-label="Open menu"
							asChild
						>
							<GiHamburgerMenu />
						</Button>
					</SheetTrigger>
					<SheetContent side="left">
						<SheetHeader>
							<SheetTitle>OpenV</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col space-y-3 mt-[1rem]">
							<DialogClose asChild>
								<Link href="/">
									<Button variant="outline" className="w-full">
										Home
									</Button>
								</Link>
							</DialogClose>
							<DialogClose asChild>
								<Link
									href="/generate"
									legacyBehavior
									passHref
									className="cursor-pointer"
								>
									<Button variant="outline">Generate</Button>
								</Link>
							</DialogClose>
						</div>
					</SheetContent>
				</Dialog>
				<ModeToggle />
			</div>
			<NavigationMenu>
				<NavigationMenuList className="max-[825px]:hidden flex gap-3 w-[100%] justify-between">
					<Link href="/" className="pl-2 flex items-center" aria-label="Home">
						<span className="text-xl font-semibold">OpenV</span>
						<span className="sr-only">Home</span>
					</Link>
				</NavigationMenuList>
				<NavigationMenuList>
					<NavigationMenuItem className="max-[825px]:hidden">
						<Link href="/generate" legacyBehavior passHref>
							<Button variant="ghost">Generate</Button>
						</Link>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<div className="flex items-center gap-2 max-[825px]:hidden">
				{userId && <UserProfile />}
				<ModeToggle />
			</div>
		</div>
	);
}

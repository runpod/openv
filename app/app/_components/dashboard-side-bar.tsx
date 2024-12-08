"use client"

import clsx from 'clsx'
import {
  Banknote,
  Folder,
  HomeIcon,
  Settings
} from "lucide-react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Separator } from '@/components/ui/separator'

export default function DashboardSideBar() {
  const pathname = usePathname();

  return (
    <div className="h-full border-r">
      <nav className="grid items-start px-4 text-sm font-medium pt-4">
        <Link
          className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
            "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/app"
          })}
          href="/app"
        >
          <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
            <HomeIcon className="h-3 w-3" />
          </div>
          Home
        </Link>
        <Link
          className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
            "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/app/projects"
          })}
          href="/app/projects"
        >
          <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
            <Folder className="h-3 w-3" />
          </div>
          Projects
        </Link>
        <Link
          className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
            "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/app/finance"
          })}
          href="/app/finance"
        >
          <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
            <Banknote className="h-3 w-3" />
          </div>
          Finance
        </Link>
        <Separator className="my-3" />
        <Link
          className={clsx("flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50", {
            "flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50": pathname === "/app/settings"
          })}
          href="/app/settings"
          id="onboarding"
        >
          <div className="border rounded-lg dark:bg-black dark:border-gray-800 border-gray-400 p-1 bg-white">
            <Settings className="h-3 w-3" />
          </div>
          Settings
        </Link>
      </nav>
    </div>
  )
}

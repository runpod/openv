import { currentUser } from "@clerk/nextjs/server"
import { ReactNode } from "react"

import { isAuthorized } from "@/utils/data/user/isAuthorized"

import DashboardSideBar from "./_components/dashboard-side-bar"
import DashboardTopNav from "./_components/dashbord-top-nav"

export default async function DashboardLayout({ children }: { children: ReactNode }) {

  const user = await currentUser()
  const { authorized, message } = await isAuthorized(user?.id!)
  if (!authorized) {
    console.log('authorized check fired')
  }
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <DashboardSideBar />
      <DashboardTopNav >
        <main className="flex flex-col gap-4 p-4 lg:gap-6">
          {children}
        </main>
      </DashboardTopNav>
    </div>
  )
}

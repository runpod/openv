import NavBar from './navbar'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main className="flex min-w-screen min-h-screen flex-col pt-[4rem] items-center dark:bg-black bg-white">
        {children}
      </main>
    </>
  )
}
import AuthenticatedLayout from "@/components/layout/authenticated-layout";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

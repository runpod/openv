import { redirect } from "next/navigation";

export default function InspirationLayout({ children }: { children: React.ReactNode }) {
	redirect("/");
}

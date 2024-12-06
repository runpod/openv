"use client"
import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";

export default function SignUpPage() {
    const router = useRouter()

    if (!config?.auth?.enabled) {
        router.back()
    }

    return (
        <PageWrapper >
            <div className="flex min-w-screen justify-center my-[5rem]">
                <SignUp fallbackRedirectUrl="/" signInFallbackRedirectUrl="/dashboard" />
            </div>
        </PageWrapper>
    );
}
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signIn");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-black text-xl">Loading...</div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r bg-black text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, {session.user.name}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg">
                        {session.user.email}
                    </p>
                </div>
            </div>

            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-500 px-4 py-2 rounded m-6 cursor-pointer"
            >
                Sign Out
            </button>
        </div>
    );
}

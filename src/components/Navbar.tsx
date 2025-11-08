"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-row items-center bg-black px-4">
      <div className="text-white text-2xl font-bold mb-4">
        {session?.user ? (
          <span>Hello, {session.user.name}</span>
        ) : (
          <span>Hello</span>
        )}
      </div>

      {!session ? (
        <>
          <div className="bg-green-500 px-4 py-2 rounded m-6">
            <Link href="/signIn">Sign in</Link>
          </div>
          <div className="bg-red-500 px-4 py-2 rounded m-6">
            <Link href="/sign-up">Sign Up</Link>
          </div>
        </>
      ) : (
        <>
          <div className="bg-blue-500 px-4 py-2 rounded m-6">
            <Link href="/dashboard">Dashboard</Link>
          </div>

          <div className="bg-yellow-500 px-4 py-2 rounded m-6">
            <Link href="/groups">Groups</Link>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-500 px-4 py-2 rounded m-6 cursor-pointer"
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}

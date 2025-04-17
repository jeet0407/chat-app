"use client";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-row items-center bg-black px-4">
      <div className="text-white text-2xl font-bold mb-4">
        {session?.user ? (
          <span>Hello, {session.user.name}</span>
        ) : (
          <span>Hello</span>
        )}
      </div>

      <div className="bg-green-500 px-4 py-2 rounded m-6">
        <Link href="/signIn">Sign in</Link>
      </div>
      <div className="bg-red-500 px-4 py-2 rounded m-6">
        <Link href="/sign-up">Sign Up</Link>
      </div>

      <div className="bg-blue-500 px-4 py-2 rounded m-6">
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}

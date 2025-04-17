'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      // Check response from signIn. If not OK or has an error message, show error.
      if (!res?.ok || res.error) {
        toast.error(res?.error || "Invalid credentials")
        toast.error("Login failed")
        setIsLoading(false)
        return
      }

      toast.success("Logged in successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Something went wrong"
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-black mb-2">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <hr className="my-4" />

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors duration-200"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  )
}
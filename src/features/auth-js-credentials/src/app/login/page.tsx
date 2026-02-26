"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="p-6 max-w-sm space-y-3">
      <h1 className="text-xl font-semibold">Login</h1>

      <input
        className="w-full border px-3 py-2"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border px-3 py-2"
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="border px-3 py-2 w-full"
        onClick={() =>
          signIn("credentials", { email, password, callbackUrl: "/dashboard" })
        }
      >
        Sign in
      </button>

      <a className="text-sm underline" href="/register">
        Create account
      </a>
    </div>
  );
}
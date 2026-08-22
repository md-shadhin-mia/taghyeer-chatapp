"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded border-input border-border-subtle px-3 py-2 focus:outline-none focus:border-accent-to"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full rounded border-input border-border-subtle px-3 py-2 focus:outline-none focus:border-accent-to"
          required
        />
      </div>
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded border-border-subtle px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed bg-accent-to hover:bg-accent-from transition-colors"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
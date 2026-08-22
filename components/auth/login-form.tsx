"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/api/error";
import { isValidPhone } from "@/utils/phone";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setValidationError("Enter your name.");
      return;
    }
    if (!isValidPhone(trimmedPhone)) {
      setValidationError("Enter a valid phone number.");
      return;
    }

    try {
      await login({ phone: trimmedPhone, name: trimmedName });
      onSuccess();
    } catch {
      // surfaced below via loginError
    }
  };

  const errorMessage =
    validationError ??
    (loginError instanceof ApiError
      ? loginError.message
      : loginError
        ? "Sign in failed. Please try again."
        : null);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6">
      <h1 className="mb-1 text-lg font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-muted">
        Sign in with your name and phone number.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            className="w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none transition-colors focus:border-accent-to"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
            className="w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none transition-colors focus:border-accent-to"
            required
          />
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full rounded-md bg-accent-to px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

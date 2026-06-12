"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthActionState } from "@/app/(auth)/actions";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string;
};

export function AuthForm({ mode, action, next }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    action,
    null,
  );

  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-bold text-[#071e29]">
        Email
        <input
          autoComplete="email"
          className="h-11 rounded-xl border border-[#c2c7cf] bg-white px-3 text-sm font-medium text-[#071e29] focus:border-[#093C5D] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/30"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold text-[#071e29]">
        Password
        <input
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="h-11 rounded-xl border border-[#c2c7cf] bg-white px-3 text-sm font-medium text-[#071e29] focus:border-[#093C5D] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/30"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>

      <input name="next" type="hidden" value={next ?? ""} />

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 items-center justify-center rounded-full bg-[#093C5D] px-6 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#00263e] focus:outline-none focus:ring-4 focus:ring-[#6FD1D7]/30 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Please wait…"
          : isLogin
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="text-center text-sm text-[#42474e]">
        {isLogin ? (
          <>
            No account?{" "}
            <Link className="font-bold text-[#093C5D] underline" href="/signup">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className="font-bold text-[#093C5D] underline" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

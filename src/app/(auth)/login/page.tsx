import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth";

import { signInAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  if (await getSessionUser()) {
    redirect(next ?? "/community-gallery");
  }

  return (
    <>
      <h1 className="text-2xl font-black tracking-[-0.01em] text-primary">
        Welcome back
      </h1>
      <p className="mb-6 mt-2 text-sm text-secondary">
        Sign in to share builds and chat with Meg.
      </p>
      <AuthForm action={signInAction} mode="login" next={next} />
    </>
  );
}

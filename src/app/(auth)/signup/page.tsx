import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth";

import { signUpAction } from "../actions";

export default async function SignupPage({
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
      <h1 className="text-2xl font-black tracking-[-0.01em] text-[#001d32]">
        Create your account
      </h1>
      <p className="mb-6 mt-2 text-sm text-[#42474e]">
        Join the community to post builds and tag @keybot for grounded advice.
      </p>
      <AuthForm action={signUpAction} mode="signup" next={next} />
    </>
  );
}

import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <AuthCard
      title="Check your inbox"
      subtitle="We sent a confirmation link to your email"
    >
      <div className="flex flex-col items-center mb-4">
        <Mail size={48} color="#0EA5E9" />
      </div>

      <p className="text-[14px] text-[#64748B] text-center leading-relaxed">
        Click the link in your email to activate your account. Check your spam
        folder if you don&apos;t see it.
      </p>

      <Button
        asChild
        variant="outline"
        className="w-full h-11 mt-6 text-[14px]"
      >
        <Link href="/auth/login">Back to Sign In</Link>
      </Button>

      <p className="text-[13px] text-[#64748B] text-center mt-4">
        Didn&apos;t receive it?{" "}
        <Link
          href="/auth/resend-confirmation"
          className="text-[#0EA5E9] hover:underline"
        >
          Resend email
        </Link>
      </p>
    </AuthCard>
  );
}

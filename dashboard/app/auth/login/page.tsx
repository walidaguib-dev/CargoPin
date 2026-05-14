"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, XCircle } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  Username: z.string(),
  Password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  access_Token: string;
  refresh_Token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { Username: "", Password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URI}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (res.ok) {
        const data = (await res.json()) as LoginResponse;
        localStorage.setItem("access_token", data.access_Token);
        localStorage.setItem("refresh_token", data.refresh_Token);
        router.push("/map");
      }

      if (res.status === 401) {
        setError("root", { message: "Invalid username or password" });
      } else if (res.status === 403) {
        setError("root", {
          message: "Please confirm your email before signing in",
        });
      } else {
        setError("root", {
          message: "Something went wrong. Please try again.",
        });
      }
    } catch {
      setError("root", {
        message: "Network error. Please check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label
            htmlFor="username"
            className="text-[13px] font-medium text-[#374151]"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="your_username"
            className="h-11 mt-1.5 text-[14px]"
            aria-invalid={errors.Username ? true : undefined}
            {...register("Username")}
          />
          {errors.Username ? (
            <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
              <XCircle size={12} />
              {errors.Username.message}
            </p>
          ) : null}
        </div>

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.Password?.message}
          {...register("Password")}
        />

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-[12px] text-[#0EA5E9] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {errors.root ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[13px] text-red-600 flex items-center gap-2">
            <AlertCircle size={14} />
            {errors.root.message}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-[15px] font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-white px-3 text-[#9CA3AF]">
              or continue with
            </span>
          </div>
        </div>

        <GoogleButton />

        <p className="text-[13px] text-[#64748B] text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-[#0EA5E9] hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

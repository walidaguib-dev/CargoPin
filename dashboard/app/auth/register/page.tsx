"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, XCircle } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URI}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Username: values.fullName,
            Email: values.email,
            Password: values.password,
            Role: "Chef",
          }),
        },
      );

      console.log(res.body);

      if (res.status === 201) {
        router.push("/auth/check-email");
        return;
      }

      if (res.status === 409) {
        setError("email", {
          message: "An account with this email already exists",
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
    <AuthCard title="Create account" subtitle="Start tracking cargo today">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <Label
            htmlFor="fullName"
            className="text-[13px] font-medium text-[#374151]"
          >
            Full Name
          </Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Walid Bensalem"
            className="h-11 mt-1.5 text-[14px]"
            aria-invalid={errors.fullName ? true : undefined}
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
              <XCircle size={12} />
              {errors.fullName.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label
            htmlFor="email"
            className="text-[13px] font-medium text-[#374151]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 mt-1.5 text-[14px]"
            aria-invalid={errors.email ? true : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
              <XCircle size={12} />
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password ?? ""} />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-[15px] font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-[13px] text-[#64748B] text-center mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#0EA5E9] hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-[11px] text-[#9CA3AF] text-center mt-3">
          By creating an account you agree to our Terms of Service
        </p>
      </form>
    </AuthCard>
  );
}

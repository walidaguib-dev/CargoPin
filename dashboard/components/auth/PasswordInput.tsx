"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, id, name, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    const inputId = id ?? name ?? "password";

    return (
      <div>
        <Label
          htmlFor={inputId}
          className="text-[13px] font-medium text-[#374151]"
        >
          {label}
        </Label>
        <div className="relative mt-1.5">
          <Input
            {...rest}
            ref={ref}
            id={inputId}
            name={name}
            type={visible ? "text" : "password"}
            className="h-11 pr-10 text-[14px]"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[#9CA3AF] hover:text-[#64748B] transition-colors"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-[12px] text-red-500 mt-1 flex items-center gap-1"
          >
            <XCircle size={12} />
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

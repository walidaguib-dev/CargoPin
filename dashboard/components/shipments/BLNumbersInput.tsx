"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

interface BLNumbersInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  hasError?: boolean;
}

// Type a BL number, press Enter to add it as a tag, click the X on a tag to remove
// it. Backed by a plain string[] — matches Shipment.BLNumbers exactly, no separate
// "draft" state synced back into the array.
export function BLNumbersInput({ id, value, onChange, hasError }: BLNumbersInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      toast.error(`"${trimmed}" is already added`);
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((bl) => bl !== tag));
  };

  return (
    <div>
      {value.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((bl) => (
            <span
              key={bl}
              className="inline-flex items-center gap-1 rounded bg-[#F1F5F9] px-2 py-1 text-[12px] font-medium text-[#475569]"
            >
              {bl}
              <button
                type="button"
                aria-label={`Remove ${bl}`}
                onClick={() => removeTag(bl)}
                className="rounded-sm hover:text-[#DC2626]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="Type a BL number and press Enter..."
        aria-invalid={hasError ? true : undefined}
        className={`h-11 border-[#E2E8F0] text-[14px] focus-visible:ring-[#0EA5E9] ${
          hasError ? "border-destructive" : ""
        }`}
      />
    </div>
  );
}

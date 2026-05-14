"use client";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthState {
  filled: number;
  color: string;
  label: string;
}

const EMPTY = "#E2E8F0";

function evaluate(password: string): StrengthState | null {
  const len = password.length;
  if (len === 0) return null;
  if (len <= 5) return { filled: 1, color: "#EF4444", label: "Weak" };
  if (len <= 9) return { filled: 2, color: "#F97316", label: "Fair" };
  if (len <= 13) return { filled: 3, color: "#EAB308", label: "Good" };
  return { filled: 4, color: "#22C55E", label: "Strong" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const state = evaluate(password);
  if (!state) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors"
            style={{ backgroundColor: i < state.filled ? state.color : EMPTY }}
          />
        ))}
      </div>
      <div className="flex justify-end mt-1">
        <span
          className="text-[11px] font-medium"
          style={{ color: state.color }}
        >
          {state.label}
        </span>
      </div>
    </div>
  );
}

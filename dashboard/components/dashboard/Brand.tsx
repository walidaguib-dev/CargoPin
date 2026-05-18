import { Anchor } from "lucide-react";

export function Brand() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ backgroundColor: "rgba(14,165,233,0.10)" }}
        >
          <Anchor size={18} color="#0EA5E9" strokeWidth={2} />
        </span>
        <span className="text-[18px] font-bold leading-none text-[#0EA5E9] tracking-tight">
          CargoPin
        </span>
      </div>
      <span className="mt-2 pl-9.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#64748B]">
        Port Operations
      </span>
    </div>
  );
}

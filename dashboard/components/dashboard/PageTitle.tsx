interface PageTitleProps {
  children: string;
}

export function PageTitle({ children }: PageTitleProps) {
  return (
    <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-[#0F172A]">
      {children}
    </h3>
  );
}

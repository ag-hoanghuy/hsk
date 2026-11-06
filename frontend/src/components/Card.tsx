import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-5 shadow-card ${className}`}>{children}</div>;
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "soft";
}) {
  const style =
    variant === "primary"
      ? "bg-rose-500 text-white shadow-card hover:bg-rose-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
      : "bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${style}`}
    >
      {children}
    </button>
  );
}

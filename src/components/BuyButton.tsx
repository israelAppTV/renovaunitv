import Link from "next/link";
import { cn } from "@/utils/cn";

interface BuyButtonProps {
  href: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function BuyButton({ href, children = "Comprar", disabled, className }: BuyButtonProps) {
  const baseClass =
    "inline-block rounded-xl bg-primary px-6 py-2.5 text-center font-semibold text-white shadow-lg transition duration-200 hover:opacity-90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50";

  if (disabled) {
    return (
      <span
        className={cn(baseClass, "cursor-not-allowed opacity-50", className)}
        aria-disabled
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={cn(baseClass, className)}>
      {children}
    </Link>
  );
}

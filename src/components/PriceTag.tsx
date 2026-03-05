import { formatPrice } from "@/utils/formatPrice";
import { cn } from "@/utils/cn";

interface PriceTagProps {
  priceCents: number;
  className?: string;
}

export function PriceTag({ priceCents, className }: PriceTagProps) {
  return (
    <span className={cn("font-semibold text-accent", className)}>
      {formatPrice(priceCents)}
    </span>
  );
}

"use client";

import { type ReactNode } from "react";
import { CartProvider } from "@/modules/cart/context/CartContext";

export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

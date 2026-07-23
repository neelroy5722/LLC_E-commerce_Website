"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

/** Header cart link with an item-count badge. */
export function CartButton({ onClick }: { onClick?: () => void }) {
  const { count } = useCart();
  const label = count > 0 ? `Cart (${count})` : "Cart";
  return (
    <Link
      href="/cart"
      onClick={onClick}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink/80 transition-colors hover:text-ink"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[11px] font-bold text-brand-blue-900">
          {count}
        </span>
      )}
    </Link>
  );
}

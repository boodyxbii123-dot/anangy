"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
        <Link href="/" aria-label="asnangy. home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-navy/80 md:flex">
          <Link href="/shop" className="hover:text-navy">
            Shop
          </Link>
          <Link href="/about" className="hover:text-navy">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 text-sm font-medium text-navy"
          >
            Cart
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-xs text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-navy md:hidden"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M2.5 5.5H17.5M2.5 10H17.5M2.5 14.5H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-line bg-paper px-5 py-3 text-sm text-navy/80 md:hidden">
          <Link href="/shop" className="py-2.5" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/about" className="py-2.5" onClick={() => setOpen(false)}>
            About
          </Link>
        </nav>
      )}
    </header>
  );
}

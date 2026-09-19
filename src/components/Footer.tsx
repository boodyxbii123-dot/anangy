import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-mist">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-navy/70">
              Extracted tooth specimens supplied strictly for educational and
              dental training purposes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-medium text-navy">Shop</div>
              <ul className="mt-3 space-y-2 text-navy/70">
                <li>
                  <Link href="/shop" className="hover:text-navy">
                    Browse specimens
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-navy">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-navy">Store</div>
              <ul className="mt-3 space-y-2 text-navy/70">
                <li>
                  <Link href="/about" className="hover:text-navy">
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-navy/50">
          © {new Date().getFullYear()} asnangy. For educational and dental
          training purposes only.
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { conditionLabel, slugifyCondition } from "@/lib/utils";
import type { ToothCondition } from "@/lib/types";

export const revalidate = 0;

const CONDITION_HINT: Record<ToothCondition, string> = {
  sound: "Healthy, unrestored specimens",
  semi_sound: "Minor wear for comparative study",
  caries: "Carious lesions for detection practice",
};

export default async function ChooseConditionPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("condition")
    .eq("enabled", true);

  const conditions = Array.from(
    new Set(
      (categories ?? [])
        .map((c) => c.condition as ToothCondition)
        .sort()
    )
  );

  const order: ToothCondition[] = ["sound", "semi_sound", "caries"];
  const sorted = order.filter(
    (c) => conditions.length === 0 || conditions.includes(c)
  );

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:px-6 sm:py-14">
      <nav className="text-sm text-navy/50">
        <Link href="/" className="hover:text-navy">
          Home
        </Link>{" "}
        / Shop
      </nav>
      <h1 className="mt-3 font-display text-2xl italic text-navy sm:text-3xl">
        Choose a condition
      </h1>
      <p className="mt-2 text-sm text-navy/60">
        Every specimen is catalogued by condition first, then by tooth type.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {sorted.map((condition) => (
          <Link
            key={condition}
            href={`/shop/${slugifyCondition(condition)}`}
            className="group flex items-center justify-between rounded-2xl bg-navy px-6 py-6 shadow-soft transition active:scale-[0.98] active:bg-navy-600 sm:hover:bg-navy-600"
          >
            <div>
              <div className="font-display text-xl italic text-white sm:text-2xl">
                {conditionLabel(condition)}
              </div>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                {CONDITION_HINT[condition]}
              </p>
            </div>
            <span
              aria-hidden
              className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition group-active:bg-white/25"
            >
              →
            </span>
          </Link>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-navy/50">
            No categories are available yet. Add some from the admin
            dashboard.
          </p>
        )}
      </div>
    </div>
  );
}

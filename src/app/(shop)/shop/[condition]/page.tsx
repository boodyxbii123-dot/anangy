import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { conditionLabel, toothTypeLabel, unslugifyCondition } from "@/lib/utils";
import type { ToothType } from "@/lib/types";

export const revalidate = 0;

export default async function ChooseToothTypePage({
  params,
}: {
  params: { condition: string };
}) {
  const condition = unslugifyCondition(params.condition);
  if (!condition) notFound();

  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("tooth_type, description")
    .eq("condition", condition)
    .eq("enabled", true)
    .order("sort_order");

  const order: ToothType[] = ["anterior", "premolar", "molar"];
  const available = (categories ?? []).map((c) => c.tooth_type as ToothType);
  const sorted = order.filter(
    (t) => available.length === 0 || available.includes(t)
  );

  return (
    <div className="mx-auto max-w-xl px-5 py-10 sm:px-6 sm:py-14">
      <nav className="text-sm text-navy/50">
        <Link href="/" className="hover:text-navy">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/shop" className="hover:text-navy">
          Shop
        </Link>{" "}
        / {conditionLabel(condition)}
      </nav>
      <h1 className="mt-3 font-display text-2xl italic text-navy sm:text-3xl">
        {conditionLabel(condition)} — choose a tooth type
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        {sorted.map((type) => {
          const cat = categories?.find((c) => c.tooth_type === type);
          return (
            <Link
              key={type}
              href={`/shop/${params.condition}/${type}`}
              className="group flex items-center justify-between rounded-2xl bg-navy px-6 py-6 shadow-soft transition active:scale-[0.98] active:bg-navy-600 sm:hover:bg-navy-600"
            >
              <div>
                <div className="font-display text-xl italic text-white sm:text-2xl">
                  {toothTypeLabel(type)}
                </div>
                {cat?.description && (
                  <p className="mt-1 text-xs text-white/60 sm:text-sm">
                    {cat.description}
                  </p>
                )}
              </div>
              <span
                aria-hidden
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition group-active:bg-white/25"
              >
                →
              </span>
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-navy/50">
            No tooth types are available for this condition yet.
          </p>
        )}
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-block text-sm font-medium text-navy underline decoration-navy/30 underline-offset-4"
      >
        ← Change condition
      </Link>
    </div>
  );
}

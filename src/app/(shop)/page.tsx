import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ToothCondition } from "@/lib/types";

const CONDITION_COPY: Record<
  ToothCondition,
  { title: string; description: string }
> = {
  sound: {
    title: "Sound",
    description: "Healthy, unrestored specimens for baseline anatomy work.",
  },
  semi_sound: {
    title: "Semi Sound",
    description: "Minor wear or minimal restoration for comparative study.",
  },
  caries: {
    title: "Caries",
    description: "Carious lesions present, for detection and restorative practice.",
  },
};

export default async function HomePage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("condition")
    .eq("enabled", true);

  const conditions = Array.from(
    new Set((categories ?? []).map((c) => c.condition as ToothCondition))
  );
  const orderedConditions: ToothCondition[] = ["sound", "semi_sound", "caries"].filter(
    (c) => conditions.length === 0 || conditions.includes(c as ToothCondition)
  ) as ToothCondition[];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <p className="text-sm font-medium text-navy/60">
          For dental students &amp; educators
        </p>
        <h1 className="mt-3 font-display text-6xl italic leading-[1.1] text-navy sm:text-7xl md:text-8xl">
          Real specimens
        </h1>
        <p className="mx-auto mt-5 max-w-prose text-navy/70">
          We are specialized in supplying natural teeth for dental
          students — sorted by condition and tooth type, each one tracked
          by its own product code, so what you order is exactly what you
          study.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy/90"
          >
            Browse specimens
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-navy transition hover:border-navy/30"
          >
            About the collection
          </Link>
        </div>
      </section>

      {/* Conditions */}
      <section className="border-t border-line bg-mist/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl italic text-navy">
            Start with a condition
          </h2>
          <div className="mt-8 flex flex-col gap-4 sm:grid sm:grid-cols-3">
            {orderedConditions.map((condition) => (
              <Link
                key={condition}
                href={`/shop/${condition.replace("_", "-")}`}
                className="group flex items-center justify-between rounded-2xl bg-navy p-6 shadow-soft transition active:scale-[0.98] sm:block sm:hover:bg-navy-600"
              >
                <div>
                  <div className="font-display text-xl italic text-white">
                    {CONDITION_COPY[condition].title}
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    {CONDITION_COPY[condition].description}
                  </p>
                  <span className="mt-4 hidden text-sm font-bold text-white underline decoration-white/30 underline-offset-4 group-hover:decoration-white sm:inline-block">
                    View tooth types
                  </span>
                </div>
                <span
                  aria-hidden
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white sm:hidden"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose note */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm leading-relaxed text-navy/60">
          Every specimen sold by asnangy. is intended strictly for
          educational and dental training purposes — anatomy study, caries
          detection practice, and restorative technique training.
        </p>
      </section>
    </>
  );
}

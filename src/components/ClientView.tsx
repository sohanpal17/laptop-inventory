import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BRANDS,
  CATEGORIES,
  CATEGORY_META,
  imageFor,
  inr,
  ramGb,
  specLine,
  type Category,
  type Laptop,
} from "../data";

interface Props {
  laptops: Laptop[];
  onEnquire: (prompt: string) => void;
}

type Sort = "price-asc" | "price-desc" | "name" | "newest";

const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest intake" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "name", label: "Model A–Z" },
];

export default function ClientView({ laptops, onEnquire }: Props) {
  const [cats, setCats] = useState<Category[]>([]);
  const [brand, setBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(300000);
  const [minRam, setMinRam] = useState(0);
  const [sort, setSort] = useState<Sort>("newest");
  const [open, setOpen] = useState<string | null>(null);

  const units = laptops.reduce((s, l) => s + l.stock, 0);
  const cheapest = laptops.length ? Math.min(...laptops.map((l) => l.price)) : 0;

  const rows = useMemo(() => {
    const list = laptops.filter(
      (l) =>
        (cats.length === 0 || cats.includes(l.category)) &&
        (brand === "All" || l.brand === brand) &&
        l.price <= maxPrice &&
        ramGb(l.ram) >= minRam,
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.model.localeCompare(b.model));
    if (sort === "newest") sorted.sort((a, b) => b.added.localeCompare(a.added));
    return sorted;
  }, [laptops, cats, brand, maxPrice, minRam, sort]);

  const reset = () => {
    setCats([]);
    setBrand("All");
    setMaxPrice(300000);
    setMinRam(0);
    setSort("newest");
  };

  const toggleCat = (c: Category) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div>
      {/* ============================ HERO ============================ */}
      <section className="relative isolate overflow-hidden bg-navydeep">
        <img
          src="images/hero-desk.jpg"
          alt="An open laptop on a matte navy workshop desk in cool daylight"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navydeep via-navydeep/92 to-navydeep/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-navydeep via-transparent to-navydeep/40" />

        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-[1320px] flex-col justify-end px-4 pb-12 pt-28 sm:px-8 sm:pb-16">
          <p className="label-mono text-white/60">
            Spec sheet No. 04 &nbsp;·&nbsp; live inventory &nbsp;·&nbsp; Bengaluru workshop
          </p>

          <h1 className="mt-6 font-display text-[clamp(2.6rem,8.4vw,7.2rem)] font-bold uppercase leading-[0.87] tracking-[-0.035em] text-white">
            Every spec.
            <br />
            Every price.
            <br />
            <span className="text-white/45">One ruled page.</span>
          </h1>

          <div className="mt-8 grid gap-8 border-t border-white/15 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p className="max-w-[52ch] text-[15px] leading-relaxed text-white/72">
              A working inventory of the laptops we hold in stock — checked, priced in ₹ and listed
              without the marketing. Filter the index, unfold any row for its full spec sheet, or ask
              the assistant: it reads exactly this list.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#index"
                className="rounded-md bg-white px-6 py-3.5 text-[13px] font-semibold text-navy transition-colors hover:bg-[#e6e9f2]"
              >
                Browse the index ↓
              </a>
              <button
                onClick={() => onEnquire("What should I look at first?")}
                className="rounded-md border border-white/30 px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
              >
                Ask the assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ STAT STRIP ============================ */}
      <div className="border-y border-rule bg-white">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-px bg-rule md:grid-cols-4">
          {[
            ["Models listed", String(laptops.length).padStart(2, "0")],
            ["Units in stock", String(units)],
            ["Entry price", inr(cheapest)],
            ["Last intake", laptops[0]?.added ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white px-5 py-6 sm:px-8">
              <p className="label-mono text-muted">{k}</p>
              <p className="tnum mt-2 font-display text-[clamp(1.5rem,3vw,2.15rem)] font-semibold leading-none text-navy">
                {v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ============================ INDEX ============================ */}
      <section id="index" className="blueprint scroll-mt-20">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono text-muted">Section 01 — the inventory</p>
              <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2.1rem,5vw,3.6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-navy">
                The index, ruled and sortable.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono mr-1 text-muted">Sort</span>
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                    sort === s.key
                      ? "border-navy bg-navy text-white"
                      : "border-rule bg-white text-[#4c5871] hover:border-[#9aa5bb]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
            {/* -------- filter rail -------- */}
            <aside className="lg:sticky lg:top-[86px] lg:self-start">
              <div className="rounded-xl border border-rule bg-white p-5">
                <p className="label-mono text-muted">Filter</p>

                <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4c5871]">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const on = cats.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCat(c)}
                        className={`rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-all ${
                          on
                            ? "bg-navy text-white"
                            : `${CATEGORY_META[c].chip} opacity-80 hover:opacity-100`
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4c5871]">
                  Brand
                </p>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-md border border-[#c9cfdb] bg-white px-3 py-2 text-[12.5px] focus:border-navy focus:outline-none"
                >
                  <option value="All">All brands</option>
                  {BRANDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>

                <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4c5871]">
                  Budget ceiling
                </p>
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#10254a]"
                />
                <p className="tnum mt-1 font-mono text-[11.5px] text-navy">up to {inr(maxPrice)}</p>

                <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4c5871]">
                  Minimum memory
                </p>
                <div className="flex flex-wrap gap-2">
                  {[0, 8, 16, 32].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRam(r)}
                      className={`rounded-md border px-2.5 py-1 text-[11px] font-mono transition-colors ${
                        minRam === r
                          ? "border-navy bg-navy text-white"
                          : "border-rule bg-white text-[#4c5871] hover:border-[#9aa5bb]"
                      }`}
                    >
                      {r === 0 ? "any" : `${r}GB+`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={reset}
                  className="mt-7 w-full rounded-md border border-rule py-2 text-[11.5px] font-medium text-muted transition-colors hover:border-navy hover:text-navy"
                >
                  Reset all filters
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-navy/15 bg-navy px-5 py-4">
                <p className="label-mono text-white/50">Sorted result</p>
                <p className="tnum mt-1.5 font-display text-[1.8rem] font-semibold leading-none text-white">
                  {String(rows.length).padStart(2, "0")}
                  <span className="text-white/45 text-[1rem]"> / {String(laptops.length).padStart(2, "0")}</span>
                </p>
                <p className="mt-1.5 text-[11px] text-white/55">machines match your filters</p>
              </div>
            </aside>

            {/* -------- the ruled index -------- */}
            <div>
              <div className="flex items-center gap-4 border-b-2 border-navy pb-2.5">
                <span className="label-mono w-[34px] shrink-0 text-muted">No.</span>
                <span className="label-mono text-muted">Machine</span>
                <span className="label-mono ml-auto hidden text-muted sm:block">Key specification</span>
                <span className="label-mono shrink-0 text-right text-muted lg:w-[112px]">Price</span>
                <span className="w-5 shrink-0" />
              </div>

              {rows.length === 0 ? (
                <div className="border-b border-rule px-2 py-20 text-center">
                  <p className="font-display text-[1.35rem] font-semibold text-navy">
                    Nothing on the shelf matches that.
                  </p>
                  <p className="mx-auto mt-2 max-w-[38ch] text-[13px] text-muted">
                    Loosen the budget ceiling or clear a category — or ask the assistant to find the
                    closest machine we do hold.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-6 rounded-md bg-navy px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-navylight"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {rows.map((l, i) => {
                      const isOpen = open === l.id;
                      return (
                        <motion.li
                          key={l.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="border-b border-rule"
                        >
                          <button
                            onClick={() => setOpen(isOpen ? null : l.id)}
                            aria-expanded={isOpen}
                            className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-white/70"
                          >
                            <span className="tnum w-[34px] shrink-0 font-mono text-[11px] text-muted">
                              {String(i + 1).padStart(2, "0")}
                            </span>

                            <img
                              src={imageFor(l.category)}
                              alt={`${l.brand} ${l.model}`}
                              loading="lazy"
                              className="hidden h-[46px] w-[68px] shrink-0 rounded-[3px] object-cover opacity-95 grayscale-[0.35] transition-all duration-300 group-hover:grayscale-0 sm:block"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2.5">
                                <span className="font-display text-[1.06rem] font-semibold leading-tight text-navy">
                                  {l.brand} {l.model}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                    CATEGORY_META[l.category].chip
                                  }`}
                                >
                                  {l.category}
                                </span>
                                {l.stock <= 3 && (
                                  <span className="label-mono text-signal">
                                    only {l.stock} left
                                  </span>
                                )}
                              </span>
                              <span className="mt-1 block truncate font-mono text-[11px] text-muted">
                                {specLine(l)}
                              </span>
                            </span>

                            <span className="tnum hidden w-[112px] shrink-0 text-right font-mono text-[15px] font-semibold text-signal lg:block">
                              {inr(l.price)}
                            </span>
                            <span className="tnum shrink-0 text-right font-mono text-[14px] font-semibold text-signal lg:hidden">
                              {inr(l.price)}
                            </span>

                            <span
                              className={`w-5 shrink-0 text-muted transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="grid gap-6 pb-7 pt-1 md:grid-cols-[minmax(0,1fr)_240px]">
                                  <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
                                    {[
                                      ["Processor", l.processor],
                                      ["Memory", l.ram],
                                      ["Storage", l.storage],
                                      ["Graphics", l.gpu],
                                      ["Display", l.display],
                                      ["SKU / intake", `${l.sku} · ${l.added}`],
                                    ].map(([k, v]) => (
                                      <div key={k} className="bg-white px-4 py-3">
                                        <dt className="label-mono text-muted">{k}</dt>
                                        <dd className="mt-1 font-mono text-[12.5px] text-ink">{v}</dd>
                                      </div>
                                    ))}
                                  </dl>

                                  <div className="rounded-lg border border-rule bg-white p-5">
                                    <p className="label-mono text-muted">Stock on hand</p>
                                    <p className="tnum mt-1 font-display text-[2rem] font-semibold leading-none text-navy">
                                      {String(l.stock).padStart(2, "0")}
                                      <span className="ml-1 text-[0.85rem] font-sans text-muted">units</span>
                                    </p>
                                    <p className="tnum mt-4 border-t border-rule pt-4 font-mono text-[1.35rem] font-semibold text-signal">
                                      {inr(l.price)}
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted">
                                      incl. GST · 1 yr on-site warranty
                                    </p>
                                    <button
                                      onClick={() =>
                                        onEnquire(`I'm interested in the ${l.brand} ${l.model}.`)
                                      }
                                      className="mt-4 w-full rounded-md bg-navy py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-navylight"
                                    >
                                      Enquire about this
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ BENCH BAND (overlapping planes) ============================ */}
      <section className="overflow-hidden border-y border-rule bg-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-8 sm:py-20">
          <div className="relative grid items-center gap-0 lg:grid-cols-2">
            <img
              src="images/bench.jpg"
              alt="A laptop opened for inspection on the service bench"
              loading="lazy"
              className="h-[300px] w-full rounded-sm object-cover sm:h-[400px] lg:h-[520px] lg:w-[calc(100%+5rem)]"
            />
            <div className="relative z-10 -mt-10 bg-navy px-7 py-9 sm:px-10 sm:py-11 lg:-ml-20 lg:mt-0">
              <p className="label-mono text-white/50">Section 02 — the bench</p>
              <blockquote className="mt-5 font-display text-[clamp(1.55rem,3.1vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-white">
                “Nothing enters the index until it has been through the bench.”
              </blockquote>
              <p className="mt-5 text-[12.5px] leading-relaxed text-white/62">
                Every machine is opened, re-pasted where needed, memory-tested for 72 hours and
                logged against its serial before it is listed here. If it fails, it never reaches
                this page.
              </p>
              <p className="mt-5 border-t border-white/15 pt-4 text-[11.5px] text-white/55">
                Rahul Menon · service lead, Hosur Road workshop
              </p>
              <dl className="mt-7 grid grid-cols-3 gap-px bg-white/12">
                {[
                  ["48", "point check"],
                  ["72h", "burn-in"],
                  ["1 yr", "on-site"],
                ].map(([v, k]) => (
                  <div key={k} className="bg-navy px-3 py-4">
                    <dt className="tnum font-display text-[1.35rem] font-semibold leading-none text-white">
                      {v}
                    </dt>
                    <dd className="label-mono mt-1.5 text-white/50">{k}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section className="bg-navy text-white">
        <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-8 sm:py-24">
          <p className="label-mono text-white/50">Section 03 — how buying works</p>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Three steps, no showroom theatre.
            </h2>
            <ol className="divide-y divide-white/12 border-y border-white/12">
              {[
                [
                  "01",
                  "Shortlist from the index",
                  "Filter by category, brand, budget ceiling and memory. Every row unfolds to a full spec sheet — the same data our technicians work from.",
                ],
                [
                  "02",
                  "Open a conversation",
                  "The assistant answers from live stock: ask for the cheapest gaming machine under ₹1,00,000, or the lightest laptop for travel.",
                ],
                [
                  "03",
                  "Collect or ship",
                  "Reserve against stock and pick up from the Bengaluru workshop the same day, or ship insured across India in 2–4 working days.",
                ],
              ].map(([n, title, body], i) => (
                <li
                  key={n}
                  className={`flex gap-6 py-6 ${i === 0 ? "text-white" : "text-white/80"}`}
                >
                  <span className="tnum font-mono text-[12px] text-white/45">{n}</span>
                  <div>
                    <h3
                      className={`font-display font-semibold tracking-tight ${
                        i === 0 ? "text-[1.45rem]" : "text-[1.15rem]"
                      }`}
                    >
                      {title}
                    </h3>
                    <p className="mt-2 max-w-[56ch] text-[13px] leading-relaxed text-white/62">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-rule bg-white">
        <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-4 py-12 sm:grid-cols-3 sm:px-8">
          <div>
            <p className="font-display text-[1.35rem] font-bold leading-none tracking-tight text-navy">
              The Laptop Index
            </p>
            <p className="mt-3 max-w-[34ch] text-[12px] leading-relaxed text-muted">
              Workshop 14, Hosur Road, Bengaluru 560068 · Mon–Sat, 10:00–19:00 IST. Demo storefront —
              no orders are processed.
            </p>
          </div>
          <div>
            <p className="label-mono text-muted">Registry</p>
            <ul className="mt-3 space-y-1.5 text-[12px] text-[#4c5871]">
              <li>{laptops.length} models listed</li>
              <li>{units} units on hand</li>
              <li>Prices shown inclusive of GST</li>
              <li>Warranty handled in-house</li>
            </ul>
          </div>
          <div>
            <p className="label-mono text-muted">Contact</p>
            <ul className="mt-3 space-y-1.5 font-mono text-[12px] text-[#4c5871]">
              <li>+91 80 4114 2280</li>
              <li>desk@laptopindex.in</li>
              <li>support@laptopindex.in</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-rule">
          <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-8">
            <p className="label-mono text-muted">© 2026 The Laptop Index — front-end demonstration</p>
            <p className="label-mono text-muted">Built with React · data held in session</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

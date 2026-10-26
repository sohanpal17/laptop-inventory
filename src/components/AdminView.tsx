import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BRANDS,
  CATEGORIES,
  CATEGORY_META,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  inr,
  specLine,
  type Category,
  type Laptop,
} from "../data";

interface Props {
  laptops: Laptop[];
  onAdd: (l: Omit<Laptop, "id" | "sku" | "added">) => void;
  onRemove: (id: string) => void;
}

const fieldClass =
  "w-full rounded-md border border-[#c9cfdb] bg-white px-3 py-2.5 text-[13px] text-ink " +
  "placeholder:text-[#9aa2b4] transition-colors hover:border-[#9aa5bb] focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15";

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[12px] font-medium text-[#4c5871]">{children}</span>;
}

export default function AdminView({ laptops, onAdd, onRemove }: Props) {
  const [brand, setBrand] = useState("Dell");
  const [category, setCategory] = useState<Category>("Gaming");
  const [model, setModel] = useState("");
  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("16 GB DDR5");
  const [storage, setStorage] = useState("512 GB NVMe SSD");
  const [gpu, setGpu] = useState("");
  const [price, setPrice] = useState("");
  const [display, setDisplay] = useState("");
  const [stock, setStock] = useState("5");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const units = laptops.reduce((s, l) => s + l.stock, 0);
    const value = laptops.reduce((s, l) => s + l.price * l.stock, 0);
    const avg = laptops.length ? Math.round(value / Math.max(units, 1)) : 0;
    return { units, value, avg, models: laptops.length };
  }, [laptops]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return laptops;
    return laptops.filter((l) =>
      `${l.brand} ${l.model} ${l.category} ${l.processor} ${l.gpu}`.toLowerCase().includes(q),
    );
  }, [laptops, query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !processor.trim() || !gpu.trim() || !display.trim()) {
      setError("Model name, processor, GPU and display are all required.");
      return;
    }
    const n = Number(price);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Enter a valid price in ₹ — numbers only.");
      return;
    }
    onAdd({
      brand,
      category,
      model: model.trim(),
      processor: processor.trim(),
      ram,
      storage,
      gpu: gpu.trim(),
      display: display.trim(),
      price: Math.round(n),
      stock: Math.max(1, Number(stock) || 1),
    });
    setModel("");
    setProcessor("");
    setGpu("");
    setPrice("");
    setDisplay("");
    setStock("5");
    setError("");
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-24 pt-6 sm:px-8">
      {/* Title slab — as specified in the reference mock */}
      <header className="rounded-2xl bg-navy px-6 py-7 shadow-[0_18px_40px_-28px_rgba(8,23,46,0.9)] sm:px-10 sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(1.75rem,4.2vw,2.65rem)] font-bold leading-none tracking-tight text-white">
            Laptop Inventory Management
          </h1>
          <p className="label-mono text-white/55">Console · intake &amp; stock control</p>
        </div>
      </header>

      {/* Ruled stat strip */}
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule md:grid-cols-4">
        {[
          ["Registered models", String(stats.models)],
          ["Units in stock", String(stats.units)],
          ["Inventory value", inr(stats.value)],
          ["Average unit price", inr(stats.avg)],
        ].map(([k, v]) => (
          <div key={k} className="bg-white px-5 py-4">
            <p className="label-mono text-muted">{k}</p>
            <p className="tnum mt-1.5 font-display text-[1.45rem] font-semibold leading-none text-navy">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
        {/* ---------------- Add form ---------------- */}
        <section className="rounded-2xl border border-rule bg-white p-6 sm:p-8">
          <h2 className="font-display text-[1.35rem] font-bold leading-none text-navy">
            Add Laptop to Inventory
          </h2>
          <div className="mt-3 mb-6 h-px w-full bg-rule" />

          <form onSubmit={submit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <select className={fieldClass} value={brand} onChange={(e) => setBrand(e.target.value)}>
                  {BRANDS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className={fieldClass}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Model Name</Label>
              <input
                className={fieldClass}
                placeholder="e.g. XPS 15 9530"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Label>Processor</Label>
              <input
                className={fieldClass}
                placeholder="e.g. Intel Core i7-13700H"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label>RAM</Label>
                <select className={fieldClass} value={ram} onChange={(e) => setRam(e.target.value)}>
                  {RAM_OPTIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Storage</Label>
                <select className={fieldClass} value={storage} onChange={(e) => setStorage(e.target.value)}>
                  {STORAGE_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label>GPU</Label>
                <input
                  className={fieldClass}
                  placeholder="e.g. RTX 4060 8GB"
                  value={gpu}
                  onChange={(e) => setGpu(e.target.value)}
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <input
                  className={`${fieldClass} tnum font-mono`}
                  placeholder="e.g. 124990"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Display</Label>
              <input
                className={fieldClass}
                placeholder='e.g. 15.6" FHD 144Hz'
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Label>Opening stock (units)</Label>
              <input
                className={`${fieldClass} tnum font-mono`}
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ""))}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-md border border-signal/25 bg-signal/8 px-3 py-2 text-[12px] text-signal"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-navy py-3.5 text-[14px] font-bold tracking-wide text-white transition-colors hover:bg-navylight active:translate-y-px"
            >
              Add Laptop
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Demo console — records are held in browser memory for this session and appear on the
              storefront index immediately.
            </p>
          </form>
        </section>

        {/* ---------------- Registered list ---------------- */}
        <section className="rounded-2xl border border-rule bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[1.35rem] font-bold leading-none text-navy">
              Registered Laptops ({laptops.length})
            </h2>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search registry…"
                className="w-[190px] rounded-md border border-[#c9cfdb] bg-white py-2 pl-8 pr-3 text-[12px] focus:border-navy focus:outline-none"
              />
              <svg
                className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.2-3.2" />
              </svg>
            </div>
          </div>
          <div className="mt-3 mb-6 h-px w-full bg-rule" />

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-rule px-6 py-16 text-center">
              <p className="font-display text-[1.15rem] font-semibold text-navy">
                {laptops.length === 0 ? "The registry is empty" : "Nothing matches that search"}
              </p>
              <p className="mx-auto mt-2 max-w-[320px] text-[12.5px] text-muted">
                {laptops.length === 0
                  ? "Add the first machine with the intake form and it will be listed here and on the storefront."
                  : "Try a brand, a model or a GPU name such as “RTX 4060”."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {filtered.map((l) => (
                  <motion.li
                    key={l.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-[#dfe3ec] bg-[#fbfcfe] px-5 py-4 transition-colors hover:border-[#b9c1d1]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-[1.02rem] font-bold leading-tight text-navy">
                            {l.brand} {l.model}
                          </h3>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                              CATEGORY_META[l.category].chip
                            }`}
                          >
                            {l.category}
                          </span>
                          <span className="label-mono text-muted">{l.sku}</span>
                        </div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{specLine(l)}</p>
                        <p className="tnum mt-1 font-mono text-[11px] text-muted">
                          {l.display} · {l.stock} in stock · added {l.added}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="tnum font-mono text-[1.05rem] font-semibold text-signal">
                          {inr(l.price)}
                        </span>
                        <button
                          onClick={() => onRemove(l.id)}
                          className="rounded-md bg-[#fde8e6] px-3.5 py-1.5 text-[12px] font-semibold text-[#c02616] transition-colors hover:bg-[#f9d2ce]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

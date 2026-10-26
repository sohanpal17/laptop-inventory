import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRANDS, CATEGORY_META, imageFor, inr, ramGb, type Laptop } from "../data";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  laptops: Laptop[];
  seed: { text: string; ts: number } | null;
  onNotify: (msg: string) => void;
}

interface Msg {
  id: number;
  from: "bot" | "user";
  text: string;
  items?: Laptop[];
  chips?: string[];
}

const QUICK = [
  "Cheapest gaming laptop",
  "Best under ₹1,00,000",
  "Light laptop for travel",
  "Do you have MacBooks?",
  "What's the warranty?",
];

const HELP_CHIPS = ["Cheapest gaming laptop", "Best under ₹1,00,000", "Something for video editing"];

const greeting: Omit<Msg, "id"> = {
  from: "bot",
  text:
    "You've reached the index desk. I answer straight from the live inventory on this site — ask me for a budget, a use case, a brand, or the cheapest machine we hold.",
  chips: QUICK,
};

function parseBudget(t: string): number | null {
  const m = t.match(/(?:under|below|within|less than|max|upto|up to|budget of|budget)\D{0,4}(?:₹|rs\.?)?\s*([\d,\.]+)\s*(lakh|lakhs|k|thousand)?/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("lakh")) return n * 100000;
  if (unit === "k" || unit === "thousand") return n * 1000;
  return n < 1000 ? n * 1000 : n;
}

function answer(input: string, laptops: Laptop[]): Omit<Msg, "id"> {
  const t = input.toLowerCase();

  if (/^(hi|hello|hey|namaste|hola)\b/.test(t.trim()))
    return {
      from: "bot",
      text: "Hello — tell me what the machine is for, or a budget, and I'll pull the right rows from the index.",
      chips: QUICK,
    };

  if (/thank|thanks|great|nice/.test(t))
    return { from: "bot", text: "Any time. The index refreshes as stock changes — ask again whenever you like.", chips: HELP_CHIPS };

  if (/warranty|guarantee|service|repair/.test(t))
    return {
      from: "bot",
      text:
        "Every machine carries 1 year on-site warranty across India, handled by our own bench in Bengaluru. Extended cover to 3 years is ₹4,990 on most models — Apple Care is quoted separately.",
      chips: HELP_CHIPS,
    };

  if (/deliver|ship|shipping|pickup|pick up|courier|emi|payment|finance/.test(t))
    return {
      from: "bot",
      text:
        "Pickup from the Hosur Road workshop is same-day against stock. Insured shipping anywhere in India takes 2–4 working days. EMI starts at 6 months no-cost on most cards; 18% GST invoice is issued for every order.",
      chips: HELP_CHIPS,
    };

  if (/stock|available|availability|how many/.test(t)) {
    const units = laptops.reduce((s, l) => s + l.stock, 0);
    return {
      from: "bot",
      text: `Right now the index holds ${laptops.length} models and ${units} units in total. ${
        laptops.filter((l) => l.stock <= 3).length
      } of them are down to their last three units.`,
      items: laptops.slice(0, 2),
    };
  }

  // ---- filters ----
  const budget = parseBudget(t);
  let cats: string[] = [];
  if (/gaming|game|fps|esport|rtx|stream/.test(t)) cats.push("Gaming");
  if (/ultrabook|thin|light|portable|travel|college|coding|programming|student|business|battery|compact/.test(t))
    cats.push("Ultrabook");
  if (/workstation|edit|video|3d|render|machine learning|ml|ai|cad|professional|heavy|animation/.test(t))
    cats.push("Workstation");
  if (/everyday|daily|home|office work|basic|study|browse|netflix/.test(t)) cats.push("Everyday");

  const brand = BRANDS.find((b) => t.includes(b.toLowerCase()));
  const apple = /mac|macos|apple|ios/.test(t) ? "Apple" : null;
  const wantsRam = /\b(32|16|64|8)\s*(gb|gigs?)\b/.test(t);
  const ramFilter = wantsRam ? parseInt(t.match(/\b(32|16|64|8)\s*(gb|gigs?)\b/)![1], 10) : 0;

  let pool = laptops.filter(
    (l) =>
      (cats.length === 0 || cats.includes(l.category)) &&
      (!brand || l.brand === brand) &&
      (!apple || l.brand === "Apple") &&
      (budget === null || l.price <= budget) &&
      (ramFilter === 0 || ramGb(l.ram) >= ramFilter),
  );

  const cheapest = /cheap|cheapest|low(est)?\s*(cost|price)|affordable|value|save/.test(t);
  const powerful = /best|powerful|top|fastest|premium|flagship|no compromise|heavy duty/.test(t);

  pool = [...pool].sort((a, b) => (powerful ? b.price - a.price : a.price - b.price));

  if (pool.length === 0) {
    const fallback = [...laptops].sort((a, b) => a.price - b.price).slice(0, 3);
    return {
      from: "bot",
      text: `Nothing in stock matches that exactly${
        budget ? ` under ${inr(budget)}` : ""
      } — but here are the closest machines I do have on the shelf right now.`,
      items: fallback,
      chips: HELP_CHIPS,
    };
  }

  const shown = pool.slice(0, 3);
  const bits: string[] = [];
  if (cats.length) bits.push(cats.join(" / ").toLowerCase());
  if (brand || apple) bits.push(brand || "Apple");
  if (budget) bits.push(`under ${inr(budget)}`);
  if (ramFilter) bits.push(`${ramFilter}GB+ memory`);
  if (cheapest) bits.push("lowest price first");

  const range = `${inr(pool[0].price)} – ${inr(pool[pool.length - 1].price)}`;

  return {
    from: "bot",
    text:
      pool.length === 1
        ? `Exactly one machine fits ${bits.length ? `that brief (${bits.join(", ")})` : "that"}:`
        : `I found ${pool.length} ${pool.length === 1 ? "machine" : "machines"}${
            bits.length ? ` for ${bits.join(", ")}` : ""
          }. Range ${range} — here are the top ${shown.length}:`,
    items: shown,
    chips: HELP_CHIPS,
  };
}

export default function Chatbot({ open, setOpen, laptops, seed, onNotify }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{ ...greeting, id: 0 }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const lastSeed = useRef(0);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const uid = nextId.current++;
    setMsgs((m) => [...m, { id: uid, from: "user", text }]);
    setDraft("");
    setTyping(true);
    window.setTimeout(() => {
      const reply = answer(text, laptops);
      setTyping(false);
      setMsgs((m) => [...m, { ...reply, id: nextId.current++ }]);
    }, 620);
  };

  useEffect(() => {
    if (seed && seed.ts !== lastSeed.current) {
      lastSeed.current = seed.ts;
      setOpen(true);
      const timer = window.setTimeout(() => send(seed.text), 260);
      return () => window.clearTimeout(timer);
    }
  }, [seed]);

  return (
    <>
      {/* launcher */}
      <motion.button
        onClick={() => setOpen(!open)}
        initial={false}
        animate={{ scale: open ? 0.92 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.22 }}
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-navy py-3.5 pl-4 pr-5 text-white shadow-[0_18px_38px_-14px_rgba(8,23,46,0.65)] transition-colors hover:bg-navylight ${
          open ? "pointer-events-none" : ""
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12a8 8 0 1 1-3.2-6.4" strokeLinecap="round" />
          <path d="M4 20l1.6-3.6" strokeLinecap="round" />
          <path d="M8 11h8M8 14h5" strokeLinecap="round" />
        </svg>
        <span className="text-[12.5px] font-semibold tracking-wide">Ask the index</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7a8]" />
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 right-4 z-50 flex h-[min(78vh,620px)] w-[min(92vw,392px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_36px_80px_-24px_rgba(8,23,46,0.6)]"
            aria-label="Index assistant chat"
          >
            {/* header */}
            <div className="relative shrink-0 overflow-hidden bg-navydeep px-5 py-4">
              <img
                src={imageFor("Workstation")}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navydeep via-navydeep/85 to-navydeep/40" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[1.05rem] font-bold leading-none text-white">
                    Index Assistant
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/65">
                    Demo bot · answers from live stock ({laptops.length} models)
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                  className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="relative mt-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6ee7a8]" />
                <span className="label-mono text-white/55">online · reads the live index</span>
              </div>
            </div>

            {/* messages */}
            <div ref={scroller} className="chat-scroll flex-1 space-y-4 overflow-y-auto bg-[#f6f7fa] px-4 py-5">
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                  className={m.from === "user" ? "flex justify-end" : ""}
                >
                  {m.from === "user" ? (
                    <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-4 py-2.5 text-[12.5px] leading-relaxed text-white">
                      {m.text}
                    </p>
                  ) : (
                    <div className="max-w-[92%]">
                      <p className="rounded-2xl rounded-bl-sm border border-[#e2e6ee] bg-white px-4 py-3 text-[12.5px] leading-relaxed text-ink">
                        {m.text}
                      </p>

                      {m.items && (
                        <ul className="mt-2.5 space-y-2">
                          {m.items.map((it) => (
                            <li
                              key={it.id}
                              className="flex items-center gap-3 overflow-hidden rounded-xl border border-[#e2e6ee] bg-white p-2.5"
                            >
                              <img
                                src={imageFor(it.category)}
                                alt=""
                                className="h-11 w-16 shrink-0 rounded object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-semibold text-navy">
                                  {it.brand} {it.model}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={`rounded px-1.5 py-px text-[9px] font-semibold ${
                                      CATEGORY_META[it.category].chip
                                    }`}
                                  >
                                    {it.category}
                                  </span>
                                  <span className="tnum font-mono text-[11px] font-semibold text-signal">
                                    {inr(it.price)}
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  onNotify(`Enquiry noted for the ${it.brand} ${it.model}`);
                                  send(`I'm interested in the ${it.brand} ${it.model}`);
                                }}
                                className="shrink-0 rounded-md border border-navy/20 px-2.5 py-1.5 text-[10.5px] font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
                              >
                                Enquire
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {m.chips && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {m.chips.map((c) => (
                            <button
                              key={c}
                              onClick={() => send(c)}
                              className="rounded-full border border-[#d5dae4] bg-white px-3 py-1.5 text-[11px] text-[#4c5871] transition-colors hover:border-navy hover:text-navy"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[#e2e6ee] bg-white px-4 py-3 w-fit">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-muted"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex shrink-0 items-center gap-2 border-t border-[#e2e6ee] bg-white px-3 py-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about a budget, use case or brand…"
                className="min-w-0 flex-1 rounded-full border border-[#d5dae4] bg-[#f6f7fa] px-4 py-2.5 text-[12.5px] outline-none transition-colors focus:border-navy focus:bg-white"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-navylight disabled:opacity-40"
                disabled={!draft.trim()}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

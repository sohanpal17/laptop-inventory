import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminView from "./components/AdminView";
import ClientView from "./components/ClientView";
import Chatbot from "./components/Chatbot";
import { SEED_LAPTOPS, type Laptop } from "./data";

type View = "store" | "admin";

export default function App() {
  const [view, setView] = useState<View>("store");
  const [laptops, setLaptops] = useState<Laptop[]>(SEED_LAPTOPS);
  const [chatOpen, setChatOpen] = useState(false);
  const [seed, setSeed] = useState<{ text: string; ts: number } | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const addLaptop = (l: Omit<Laptop, "id" | "sku" | "added">) => {
    const entry: Laptop = {
      ...l,
      id: `u${Date.now()}`,
      sku: `${l.brand.slice(0, 2).toUpperCase()}${l.model.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase()}-${String(
        Date.now(),
      ).slice(-4)}`,
      added: new Date().toISOString().slice(0, 10),
    };
    setLaptops((prev) => [entry, ...prev]);
    notify(`${l.brand} ${l.model} added to inventory`);
  };

  const removeLaptop = (id: string) => {
    const target = laptops.find((l) => l.id === id);
    setLaptops((prev) => prev.filter((l) => l.id !== id));
    notify(`${target ? `${target.brand} ${target.model}` : "Laptop"} removed from inventory`);
  };

  const enquire = (text: string) => {
    setView("store");
    setSeed({ text, ts: Date.now() });
    window.scrollTo({ top: window.scrollY, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ---------------- top bar ---------------- */}
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8">
          <button
            onClick={() => setView("store")}
            className="flex items-center gap-3 text-left"
            aria-label="The Laptop Index — home"
          >
            <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
              <rect x="1" y="1" width="30" height="30" rx="5" fill="#10254a" />
              <path d="M8.5 10.5h15v8h-15z" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M5.5 21.5h21l-1.6 2.2H7.1z" fill="#ffffff" />
              <path d="M11 13.4h9M11 15.9h6" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>
              <span className="block font-display text-[15px] font-bold leading-none tracking-tight text-navy">
                The Laptop Index
              </span>
              <span className="label-mono mt-1 block text-muted">Spec sheet No. 04</span>
            </span>
          </button>

          <nav className="ml-auto flex items-center gap-1 rounded-full border border-rule bg-white p-1">
            {([
              ["store", "Storefront"],
              ["admin", "Admin console"],
            ] as [View, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`relative rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                  view === key ? "text-white" : "text-[#4c5871] hover:text-navy"
                }`}
              >
                {view === key && (
                  <motion.span
                    layoutId="viewpill"
                    className="absolute inset-0 rounded-full bg-navy"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 border-l border-rule pl-5 lg:flex">
            <span className="label-mono text-muted">Live stock</span>
            <span className="tnum font-mono text-[12px] font-semibold text-navy">
              {String(laptops.length).padStart(2, "0")} models ·{" "}
              {String(laptops.reduce((s, l) => s + l.stock, 0))} units
            </span>
          </div>
        </div>
      </header>

      {/* ---------------- views ---------------- */}
      <AnimatePresence mode="wait">
        <motion.main
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === "store" ? (
            <ClientView laptops={laptops} onEnquire={enquire} />
          ) : (
            <AdminView laptops={laptops} onAdd={addLaptop} onRemove={removeLaptop} />
          )}
        </motion.main>
      </AnimatePresence>

      {/* ---------------- assistant ---------------- */}
      {view === "store" && (
        <Chatbot
          open={chatOpen}
          setOpen={setChatOpen}
          laptops={laptops}
          seed={seed}
          onNotify={notify}
        />
      )}

      {/* ---------------- toast ---------------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.24 }}
            className="fixed bottom-5 left-5 z-50 flex max-w-[min(88vw,380px)] items-start gap-3 rounded-xl border border-white/10 bg-navydeep px-4 py-3 text-white shadow-[0_22px_48px_-18px_rgba(8,23,46,0.8)]"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6ee7a8]" />
            <p className="text-[12.5px] leading-relaxed">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { label: "Listed", title: "A tray of veg biryani is listed", body: "25 kg, cooked at 12:30, kept hot. The donor adds it in under a minute." },
  { label: "Classified", title: "First decision: what should happen to it?", body: "The model picks one of three actions and shows why. This tray is still safe and fits one partner: DONATE." },
  { label: "Matched", title: "Second decision: who should receive it?", body: "Partners are filtered on safety, capacity and hours, then ranked on six factors. Nearest is not always first." },
  { label: "Picked up", title: "Offer accepted, pickup on the way", body: "Rank 1 accepts within the deadline. If they had said no, the offer would cascade to rank 2." },
  { label: "Counted", title: "Delivered and counted", body: "Handover is confirmed and the NGO rates the food. That rating becomes a real label for retraining." },
];

const START_H = 3; // A1 scenario: 3 hours of safe window

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return reduced;
}

function Tray({ hours }: { hours: number }) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const frac = hours / START_H;
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden="true">
      <ellipse cx="80" cy="96" rx="64" ry="10" fill="var(--ink)" opacity=".12" />
      <path d="M18 62 h124 l-10 28 a8 8 0 0 1 -7.6 5.4 H35.6 A8 8 0 0 1 28 90z" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
      <path d="M30 62 c6-20 30-26 50-26 s44 6 50 26z" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="58" cy="50" r="3" fill="var(--donate)" />
      <circle cx="92" cy="46" r="3" fill="var(--donate)" />
      <circle cx="76" cy="54" r="2.5" fill="var(--upcycle)" />
      <circle cx="132" cy="30" r="22" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="132" cy="30" r="16" fill="none" stroke="var(--muted)" strokeWidth="5" />
      <circle
        cx="132" cy="30" r="16" fill="none" stroke="var(--upcycle)" strokeWidth="5"
        strokeDasharray={`${2 * Math.PI * 16 * frac} 999`} transform="rotate(-90 132 30)"
      />
      <text x="132" y="34" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink)" className="mono">
        {h}:{String(m).padStart(2, "0")}
      </text>
    </svg>
  );
}

function StageArt({ i }: { i: number }) {
  const actions = [
    ["DONATE", "var(--donate)"],
    ["REDISTRIBUTE", "var(--redistribute)"],
    ["UPCYCLE", "var(--upcycle)"],
  ];
  if (i === 1)
    return (
      <div className="grid w-full grid-cols-3 gap-2 text-center text-xs font-bold sm:text-sm">
        {actions.map(([a, c], k) => (
          <div key={a} className="rounded-md border-2 px-1 py-3" style={{ borderColor: c, background: k === 0 ? c : "transparent", color: k === 0 ? "var(--card)" : c }}>
            {a}
            {k === 0 && <div className="mt-1 font-normal opacity-90">chosen</div>}
          </div>
        ))}
      </div>
    );
  if (i === 2 || i === 3)
    return (
      <svg viewBox="0 0 300 140" className="w-full" aria-hidden="true">
        <rect width="300" height="140" rx="8" fill="var(--secondary)" />
        <path d="M20 110 C80 90 120 120 180 70 S260 40 290 30" stroke="var(--border)" strokeWidth="10" fill="none" />
        <path d="M60 20 L120 130" stroke="var(--border)" strokeWidth="6" />
        <circle cx="90" cy="80" r="8" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2" />
        {[[200, 40, true], [150, 115, false], [250, 100, false], [40, 40, false]].map(([x, y, win], k) => (
          <circle key={k} cx={x as number} cy={y as number} r="6" fill={win ? "var(--donate)" : "var(--card)"} stroke="var(--ink)" strokeWidth="2" />
        ))}
        <path d="M90 80 Q150 40 200 40" stroke="var(--donate)" strokeWidth="3" strokeDasharray={i === 3 ? "0" : "6 5"} fill="none" />
        {i === 3 && <rect x="140" y="44" width="22" height="12" rx="3" fill="var(--ink)" />}
      </svg>
    );
  if (i === 4)
    return (
      <ol className="grid w-full gap-1 text-xs sm:text-sm">
        {["CREATED", "PREDICTED", "MATCHING", "OFFERED", "ACCEPTED", "PICKED_UP", "DELIVERED"].map((s) => (
          <li key={s} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-donate" />{s}</li>
        ))}
      </ol>
    );
  return (
    <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-1 text-sm">
      <dt className="text-muted-foreground">Category</dt><dd>cooked_meal</dd>
      <dt className="text-muted-foreground">Quantity</dt><dd>25 kg</dd>
      <dt className="text-muted-foreground">Storage</dt><dd>hot_held</dd>
      <dt className="text-muted-foreground">Served before</dt><dd>no</dd>
    </dl>
  );
}

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / total)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced]);

  const Intro = (
    <div className="max-w-xl">
      <p className="text-sm font-bold text-muted-foreground">ReFoodX · Major project 2026-27</p>
      <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
        Decide what to do with surplus food, <span className="text-donate">then</span> who should get it.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground prose-measure">
        An AI-powered food redistribution platform that compares five machine learning models to choose
        donate, redistribute or upcycle, and ranks partners on distance, capacity, time left, urgency and fairness.
      </p>
    </div>
  );

  if (reduced) {
    return (
      <section aria-label="Follow one tray of food" className="wrap section">
        {Intro}
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {STAGES.map((s, i) => (
            <li key={s.label} className="panel p-4">
              <p className="section-num">{i + 1}. {s.label}</p>
              <h2 className="mt-2 text-lg font-bold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const stage = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
  const hours = START_H - p * 1.1;
  const s = STAGES[stage];

  return (
    <section ref={ref} aria-label="Follow one tray of food" className="relative" style={{ height: "520vh" }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="wrap grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {Intro}
            <div className="mt-8 hidden lg:block" aria-hidden={p < 0.02}>
              <p className="text-sm text-muted-foreground">Scroll to follow one tray from kitchen to count.</p>
            </div>
          </div>

          <div className="panel relative p-5 sm:p-6" aria-live="polite">
            {/* progress track with the moving tray */}
            <div className="relative h-24">
              <div className="absolute inset-x-0 top-[70%] h-1 rounded bg-muted" />
              <div className="absolute left-0 top-[70%] h-1 rounded bg-donate" style={{ width: `${p * 100}%` }} />
              <div className="absolute top-0 h-24 w-28" style={{ left: `calc(${p * 100}% - ${p * 7}rem)` }}>
                <Tray hours={hours} />
              </div>
            </div>
            <ol className="mt-3 flex justify-between text-[0.7rem] font-bold sm:text-xs">
              {STAGES.map((st, i) => (
                <li key={st.label} className={i <= stage ? "text-foreground" : "text-muted-foreground"}>{st.label}</li>
              ))}
            </ol>
            <div key={stage} className="mt-6 min-h-[16rem] animate-in fade-in duration-300">
              <p className="section-num">Step {stage + 1} of 5</p>
              <h2 className="mt-1 text-2xl font-bold">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
              <div className="mt-5 flex">
                <StageArt i={stage} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Illustration based on acceptance scenario A1 in the spec. Clock shows time left in the safe window.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

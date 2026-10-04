import { useMemo, useState } from "react";
import {
  DEFAULT_WEIGHTS, DONOR, PARTNERS, CONFIG, rankPartners, deriveUrgency,
  type Weights, type Urgency, type Action,
} from "@/lib/matching";

const LABELS: Record<keyof Weights, string> = {
  dist: "Distance", cap: "Capacity fit", time: "Time left", resp: "Responsiveness", need: "Need", rel: "Reliability",
};

// Simple equirectangular projection for the schematic map.
const B = { minLat: 19.14, maxLat: 19.39, minLon: 72.95, maxLon: 73.03 };
const W = 320, H = 360;
const proj = (lat: number, lon: number) => ({
  x: ((lon - B.minLon) / (B.maxLon - B.minLon)) * (W - 40) + 20,
  y: ((B.maxLat - lat) / (B.maxLat - B.minLat)) * (H - 40) + 20,
});

export function MatchingLab() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [qty, setQty] = useState(25);
  const [hours, setHours] = useState(3);
  const [action, setAction] = useState<Action>("DONATE");
  const [urgOverride, setUrgOverride] = useState<Urgency | "auto">("auto");
  const [rejected, setRejected] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const urgency = urgOverride === "auto" ? deriveUrgency(hours) : urgOverride;
  const listing = { lat: DONOR.lat, lon: DONOR.lon, category: "cooked_meal", isVeg: true, quantityKg: qty, hoursLeft: hours, urgency, action, nowHour: 14 };
  const { eligible, filtered, weights: eff } = useMemo(() => rankPartners(listing, PARTNERS, weights), [qty, hours, action, urgency, weights]);
  const offered = eligible.find((s) => !rejected.includes(s.partner.id));
  const donorPt = proj(DONOR.lat, DONOR.lon);

  return (
    <div className="grid gap-6">
      <span className="sim-tag w-fit">Simulated demo · six fictional partners near Thane</span>
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="grid gap-5 content-start">
          <fieldset className="panel grid gap-3 p-4">
            <legend className="px-1 font-bold">Listing: veg cooked meal</legend>
            <label className="field">Quantity: <span className="mono">{qty} kg</span>
              <input type="range" min={5} max={200} value={qty} onChange={(e) => { setQty(+e.target.value); setRejected([]); }} />
            </label>
            <label className="field">Safe window left: <span className="mono">{hours.toFixed(1)} h</span>
              <input type="range" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => { setHours(+e.target.value); setRejected([]); }} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="field">Action
                <select value={action} onChange={(e) => { setAction(e.target.value as Action); setRejected([]); }}>
                  <option>DONATE</option><option>REDISTRIBUTE</option><option>UPCYCLE</option>
                </select>
              </label>
              <label className="field">Urgency
                <select value={urgOverride} onChange={(e) => setUrgOverride(e.target.value as Urgency | "auto")}>
                  <option value="auto">auto ({deriveUrgency(hours)})</option>
                  <option>low</option><option>medium</option><option>high</option><option>critical</option>
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset className="panel grid gap-3 p-4">
            <legend className="px-1 font-bold">Base weights</legend>
            {(Object.keys(LABELS) as (keyof Weights)[]).map((k) => (
              <label key={k} className="field text-sm">
                <span className="flex justify-between"><span>{LABELS[k]}</span><span className="mono text-muted-foreground">{weights[k].toFixed(2)} → {eff[k].toFixed(2)}</span></span>
                <input type="range" min={0} max={1} step={0.05} value={weights[k]} onChange={(e) => setWeights({ ...weights, [k]: +e.target.value })} />
              </label>
            ))}
            <p className="text-xs text-muted-foreground">Right-hand value is after urgency multipliers and renormalisation to sum 1.</p>
            <button type="button" className="btn btn-ghost text-sm" onClick={() => setWeights(DEFAULT_WEIGHTS)}>Reset to spec defaults</button>
          </fieldset>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
          <figure className="panel p-3">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Schematic map of the donor and six partners. Green line shows the current offer.">
              <rect width={W} height={H} fill="var(--secondary)" rx="6" />
              <circle cx={donorPt.x} cy={donorPt.y} r={(CONFIG.dMaxKm / 27.75) * (H - 40)} fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
              {offered && (() => { const q = proj(offered.partner.lat, offered.partner.lon); return <line x1={donorPt.x} y1={donorPt.y} x2={q.x} y2={q.y} stroke="var(--donate)" strokeWidth="3" />; })()}
              {PARTNERS.map((p) => {
                const q = proj(p.lat, p.lon);
                const rank = eligible.findIndex((s) => s.partner.id === p.id);
                const isRej = rejected.includes(p.id);
                return (
                  <g key={p.id}>
                    <circle cx={q.x} cy={q.y} r="9" fill={rank < 0 ? "var(--card)" : isRej ? "var(--upcycle-soft)" : offered?.partner.id === p.id ? "var(--donate)" : "var(--redistribute-soft)"} stroke="var(--ink)" strokeWidth="2" strokeDasharray={rank < 0 ? "3 2" : undefined} />
                    <text x={q.x} y={q.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--ink)">{rank < 0 ? "×" : rank + 1}</text>
                    <text x={q.x + 13} y={q.y + 4} fontSize="10" fill="var(--ink)">{p.name.split(" ")[0]}</text>
                  </g>
                );
              })}
              <rect x={donorPt.x - 8} y={donorPt.y - 8} width="16" height="16" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2" />
            </svg>
            <figcaption className="mt-2 text-xs text-muted-foreground">Square: donor. Numbers: rank. ×: removed by a hard filter. Dashed ring: 15 km radius.</figcaption>
          </figure>

          <div className="grid content-start gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-bold" aria-live="polite">
                {offered ? <>Offer sent to <span className="text-donate">{offered.partner.name}</span></> : "No eligible partner left: NO_MATCH, try fallback channel"}
              </p>
              <button type="button" className="btn btn-ghost text-sm" disabled={!offered} onClick={() => offered && setRejected([...rejected, offered.partner.id])}>Partner rejects</button>
              {rejected.length > 0 && <button type="button" className="btn btn-ghost text-sm" onClick={() => setRejected([])}>Reset cascade</button>}
            </div>
            {rejected.length > 0 && (
              <ol className="text-sm text-muted-foreground">
                {rejected.map((id, i) => <li key={id}>Attempt {i + 1}: {PARTNERS.find((p) => p.id === id)?.name} REJECTED</li>)}
                {offered && <li>Attempt {rejected.length + 1}: {offered.partner.name} OFFERED</li>}
              </ol>
            )}
            <ol className="grid gap-2">
              {eligible.map((s, i) => (
                <li key={s.partner.id} className={`panel p-3 ${rejected.includes(s.partner.id) ? "opacity-60" : ""}`} style={{ transition: "opacity .2s" }}>
                  <button type="button" className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={open === s.partner.id} onClick={() => setOpen(open === s.partner.id ? null : s.partner.id)}>
                    <span><span className="mono font-bold">#{i + 1}</span> {s.partner.name} <span className="text-xs text-muted-foreground">{s.partner.type} · {s.distanceKm.toFixed(1)} km · ETA {Math.round(s.etaH * 60)} min · {s.partner.freeKg} kg free</span></span>
                    <span className="mono font-bold">{s.finalScore!.toFixed(3)}</span>
                  </button>
                  <div className="mt-2 h-1.5 rounded bg-muted"><div className="h-1.5 rounded bg-donate" style={{ width: `${s.finalScore! * 100}%`, transition: "width .25s" }} /></div>
                  {open === s.partner.id && (
                    <table className="mt-3 w-full text-sm mono">
                      <thead><tr className="text-left text-muted-foreground"><th className="font-normal">Factor</th><th className="font-normal">S</th><th className="font-normal">w</th><th className="font-normal">w × S</th></tr></thead>
                      <tbody>
                        {(Object.keys(LABELS) as (keyof Weights)[]).map((k) => (
                          <tr key={k}><td className="font-sans">{LABELS[k]}</td><td>{s.factors![k].toFixed(2)}</td><td>{eff[k].toFixed(2)}</td><td>{(s.factors![k] * eff[k]).toFixed(3)}</td></tr>
                        ))}
                        <tr className="border-t"><td className="font-sans">Fairness × (1 − 0.15 × {s.partner.recentShare})</td><td /><td /><td>{s.score!.toFixed(3)} → {s.finalScore!.toFixed(3)}</td></tr>
                      </tbody>
                    </table>
                  )}
                </li>
              ))}
            </ol>
            <div>
              <h3 className="font-bold">Removed by hard filters</h3>
              <ul className="mt-2 grid gap-1 text-sm">
                {filtered.map((s) => (
                  <li key={s.partner.id}><span className="font-bold">{s.partner.name}</span> <span className="text-muted-foreground">— {s.failures.join("; ")}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Haversine distance, S_dist, S_cap, S_time, S_resp, S_need, S_rel, fairness penalty (λ = 0.15) and urgency multipliers follow spec 10.3.
        Average speed of {CONFIG.avgSpeedKmh} km/h for ETA and the urgency cut-offs are demo assumptions, not from the spec.
        The defaults reproduce acceptance scenario A1: the capacity-fit NGO ranks first, ahead of the nearer NGO with only 10 kg free.
      </p>
    </div>
  );
}

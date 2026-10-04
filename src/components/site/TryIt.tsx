import { useState } from "react";
import { fallbackPredict, type FallbackInput } from "@/lib/fallback";

const CATS = ["cooked_meal", "bakery", "dairy", "fruits_veg", "packaged", "raw_ingredients", "beverages", "sweets", "mixed_leftovers"];

export function TryIt() {
  const [f, setF] = useState<FallbackInput>({ category: "cooked_meal", quantityKg: 25, hoursToExpiry: 3, storage: "hot_held", servedBefore: false });
  const [res, setRes] = useState<ReturnType<typeof fallbackPredict> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(f.quantityKg > 0)) return setErr("Quantity must be greater than 0 (FR-05).");
    setErr(null);
    setRes(fallbackPredict(f));
  };

  const tag = res ? `tag-${res.action.toLowerCase()}` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="panel grid gap-4 p-5" aria-describedby="tryit-note">
        <span className="sim-tag w-fit">Simulated demo · rule-based fallback</span>
        <label className="field">Food category
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="field">Quantity (kg)
            <input type="number" min={0} step={1} value={f.quantityKg} onChange={(e) => setF({ ...f, quantityKg: Number(e.target.value) })} />
          </label>
          <label className="field">Hours to expiry
            <input type="number" step={0.5} value={f.hoursToExpiry} onChange={(e) => setF({ ...f, hoursToExpiry: Number(e.target.value) })} />
          </label>
        </div>
        <label className="field">Storage
          <select value={f.storage} onChange={(e) => setF({ ...f, storage: e.target.value as FallbackInput["storage"] })}>
            {["refrigerated", "room_temp", "hot_held", "frozen"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={f.servedBefore} onChange={(e) => setF({ ...f, servedBefore: e.target.checked })} className="h-4 w-4" />
          Served before (buffet or plate leftovers)
        </label>
        {err && <p role="alert" className="text-sm font-bold text-destructive">{err}</p>}
        <button className="btn btn-primary w-fit">Get a decision</button>
        <p id="tryit-note" className="text-xs text-muted-foreground">
          This mirrors the fallback policy in spec sections 8.4 and 9.7, not the trained model. Nearby capacity is
          assumed to be 40 kg for this demo.
        </p>
      </form>

      <div className="panel p-5" aria-live="polite">
        {!res ? (
          <p className="text-muted-foreground">Fill the form to see an action, a rule score and plain-language reasons.</p>
        ) : (
          <div className="animate-in fade-in duration-200">
            <p className="text-sm text-muted-foreground">Suggested action</p>
            <p className={`mt-1 inline-block rounded-md px-3 py-1 text-2xl font-extrabold ${tag}`}>{res.action}</p>
            <p className="mt-3 mono">Rule score {Math.round(res.confidence * 100)}%{res.lowConfidence && " · low confidence"}</p>
            <ul className="mt-4 grid gap-2">
              {(["DONATE", "REDISTRIBUTE", "UPCYCLE"] as const).map((a) => (
                <li key={a} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-2 text-sm">
                  <span>{a}</span>
                  <span className="h-2 rounded bg-muted"><span className={`block h-2 rounded bg-${a.toLowerCase()}`} style={{ width: `${res.probs[a] * 100}%`, transition: "width .3s" }} /></span>
                  <span className="mono text-right">{Math.round(res.probs[a] * 100)}%</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 font-bold">Why this decision?</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {res.reasons.length ? res.reasons.map((r) => <li key={r}>{r}</li>) : <li>No strong signals; default leans DONATE.</li>}
            </ul>
            {res.action === "UPCYCLE" && <p className="mt-4 text-sm font-bold text-upcycle">Safety rule: this food will only be offered to compost, animal feed or biogas partners.</p>}
            <p className="mt-4 text-xs text-muted-foreground">Decision support only, not a food-safety guarantee.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

interface Stat { mean: number; std: number }
interface ModelEntry { name: string; L1_test?: Record<string, Stat>; L2_expert?: Record<string, Stat> }
interface Metrics { version: string | null; models: ModelEntry[]; winner: string | null; selection_rationale: string | null }

const KEYS = [["f1_macro", "Macro-F1"], ["roc_auc_ovr_macro", "ROC-AUC (OVR)"], ["accuracy", "Accuracy"]] as const;

export function ModelComparison() {
  const [m, setM] = useState<Metrics | null | "error">(null);
  useEffect(() => {
    fetch("/data/metrics.json").then((r) => r.json()).then(setM).catch(() => setM("error"));
  }, []);

  const empty = m === "error" || !m || !m.models?.length;
  if (empty)
    return (
      <div className="panel p-6" aria-live="polite">
        <p className="text-lg font-bold">Not run yet</p>
        <p className="mt-2 text-muted-foreground prose-measure">
          No results are shown because the training pipeline has not produced real numbers. Charts appear here once
          the file below exists with values from a real run.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-ink p-4 text-sm text-ink-foreground"><code>{`make train            # or: python -m ml.train
cp ml/artifacts/<version>/metrics.json public/data/metrics.json`}</code></pre>
      </div>
    );

  return (
    <div className="panel grid gap-6 p-5">
      <p className="text-sm text-muted-foreground">Version {m.version} · L1 test split, mean ± std over seeds</p>
      {KEYS.map(([k, label]) => (
        <div key={k}>
          <h4 className="font-bold">{label}</h4>
          <ul className="mt-2 grid gap-1">
            {m.models.map((md) => {
              const s = md.L1_test?.[k];
              return (
                <li key={md.name} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-2 text-sm">
                  <span>{md.name}{m.winner === md.name && " (selected)"}</span>
                  <span className="h-2 rounded bg-muted"><span className="block h-2 rounded bg-donate" style={{ width: `${(s?.mean ?? 0) * 100}%` }} /></span>
                  <span className="mono text-right">{s ? `${s.mean.toFixed(3)} ± ${s.std.toFixed(3)}` : "n/a"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {m.selection_rationale && <p className="text-sm">{m.selection_rationale}</p>}
    </div>
  );
}

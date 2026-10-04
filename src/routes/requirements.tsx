import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome";
import { frs, nfrs, safetyRules, api, type Priority } from "@/content/spec";

export const Route = createFileRoute("/requirements")({
  head: () => ({
    meta: [
      { title: "ReFoodX requirements explorer: FR-01 to FR-22, NFRs and API" },
      { name: "description", content: "Search and filter all 22 ReFoodX functional requirements by priority, plus non-functional requirements, safety rules and the REST API." },
      { property: "og:title", content: "ReFoodX requirements explorer" },
      { property: "og:description", content: "Every functional requirement, NFR, safety rule and API endpoint from the ReFoodX specification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Requirements,
});

const PRI: Record<Priority, string> = { M: "Must", S: "Should", C: "Could" };

function Requirements() {
  const [pri, setPri] = useState<Priority[]>(["M", "S", "C"]);
  const [q, setQ] = useState("");
  const list = frs.filter((f) => pri.includes(f.p) && (f.id + " " + f.text).toLowerCase().includes(q.toLowerCase()));
  const toggle = (p: Priority) => setPri(pri.includes(p) ? pri.filter((x) => x !== p) : [...pri, p]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap section">
        <h1 className="section-title">Requirements explorer</h1>
        <p className="mt-3 text-muted-foreground prose-measure">From spec sections 5, 11, 13 and 16. M = Must, S = Should, C = Could. All M items are built first.</p>

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <label className="field min-w-[16rem] flex-1">Search
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. capacity, JWT, FR-13"
              className="rounded-md border border-input bg-card px-3 py-2" />
          </label>
          <fieldset className="flex gap-2">
            <legend className="sr-only">Priority</legend>
            {(["M", "S", "C"] as Priority[]).map((p) => (
              <button key={p} type="button" aria-pressed={pri.includes(p)} onClick={() => toggle(p)}
                className={`btn text-sm ${pri.includes(p) ? "btn-primary" : "btn-ghost"}`}>{PRI[p]}</button>
            ))}
          </fieldset>
        </div>
        <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} of {frs.length} requirements</p>
        <table className="mt-2 w-full text-left text-sm">
          <thead><tr className="border-b-2 border-foreground"><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Requirement</th><th className="py-2">Priority</th></tr></thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id} className="border-b align-top"><th scope="row" className="py-3 pr-3 mono whitespace-nowrap">{f.id}</th><td className="py-3 pr-3">{f.text}</td><td className="py-3 font-bold">{PRI[f.p]}</td></tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-16 text-2xl font-bold">Non-functional requirements</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          {nfrs.map(([k, v]) => <div key={k} className="panel p-4"><dt className="font-bold">{k}</dt><dd className="mt-1 text-sm text-muted-foreground">{v}</dd></div>)}
        </dl>

        <h2 className="mt-16 text-2xl font-bold">Safety and honesty rules</h2>
        <ul className="mt-4 grid gap-2 prose-measure">{safetyRules.map((r) => <li key={r} className="border-l-4 border-upcycle pl-3">{r}</li>)}</ul>

        <details className="mt-16">
          <summary className="cursor-pointer text-2xl font-bold font-display">REST API reference (/api/v1)</summary>
          <p className="mt-3 text-sm text-muted-foreground">JSON in and out. Bearer JWT. Errors as {'{"error": {"code", "message"}}'}. OpenAPI docs at /docs.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr className="border-b-2 border-foreground"><th className="py-2 pr-3">Method and path</th><th className="py-2 pr-3">Role</th><th className="py-2">Purpose</th></tr></thead>
              <tbody>{api.map(([p, r, d]) => <tr key={p} className="border-b align-top"><td className="py-2 pr-3 mono">{p}</td><td className="py-2 pr-3">{r}</td><td className="py-2 text-muted-foreground">{d}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      </main>
      <SiteFooter />
    </>
  );
}

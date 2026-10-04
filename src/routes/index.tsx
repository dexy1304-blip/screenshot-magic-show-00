import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader, SiteFooter, PDF_URL } from "@/components/site/SiteChrome";
import { ScrollStory } from "@/components/site/ScrollStory";
import { TryIt } from "@/components/site/TryIt";
import { MatchingLab } from "@/components/site/MatchingLab";
import { ModelComparison } from "@/components/site/ModelComparison";
import { Architecture } from "@/components/site/Architecture";
import * as S from "@/content/spec";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReFoodX: decide what happens to surplus food, then who gets it" },
      { name: "description", content: "ReFoodX compares five ML models to choose donate, redistribute or upcycle, then ranks NGOs on distance, capacity, time, urgency and fairness." },
      { property: "og:title", content: "ReFoodX: smart food redistribution" },
      { property: "og:description", content: "Comparative ML for the food action, fairness-aware matching for the partner. A college major project, 2026-27." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Section({ id, num, title, children, ink }: { id: string; num: string; title: string; children: ReactNode; ink?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`section ${ink ? "band-ink" : ""}`}>
      <div className="wrap">
        <p className="section-num">{num}</p>
        <h2 id={`${id}-h`} className="section-title mt-1 max-w-3xl">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

const ACTION_TONE = { DONATE: "tag-donate", REDISTRIBUTE: "tag-redistribute", UPCYCLE: "tag-upcycle" } as const;

function Index() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <ScrollStory />

        <Section id="problem" num="01" title="Good food is thrown away while people nearby go hungry">
          <ul className="grid gap-4 prose-measure text-lg">
            {S.problem.map((p) => <li key={p} className="border-l-4 border-saffron pl-4">{p}</li>)}
          </ul>
        </Section>

        <Section id="gap" num="02" title="What existing systems leave out">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Existing systems and their limits</caption>
              <thead><tr className="border-b-2 border-foreground"><th className="py-2 pr-4">System</th><th className="py-2 pr-4">What it does</th><th className="py-2">Limit noted in the deck</th></tr></thead>
              <tbody>
                {S.existingSystems.map((s) => (
                  <tr key={s.name} className="border-b align-top"><th scope="row" className="py-3 pr-4">{s.name}</th><td className="py-3 pr-4 text-muted-foreground">{s.tech}</td><td className="py-3 font-bold text-upcycle">{s.limit}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <details className="mt-6">
            <summary className="cursor-pointer font-bold">Seven limits of current approaches (deck slide 7)</summary>
            <ul className="mt-3 list-disc pl-6 prose-measure">{S.limitations.map((l) => <li key={l}>{l}</li>)}</ul>
          </details>
          <blockquote className="panel mt-8 border-l-4 border-l-donate p-6">
            <p className="font-display text-xl font-bold">Where ReFoodX stands</p>
            <p className="mt-2 prose-measure">AI plus matching alone is not new. The ReFoodX contribution is {S.positioning}</p>
          </blockquote>
        </Section>

        <Section id="decisions" num="03" title="Two decisions, in this order">
          <div className="grid gap-6 md:grid-cols-2">
            <div><h3 className="text-xl font-bold">1. What should happen to this food?</h3><p className="mt-2 text-muted-foreground">A multiclass classifier predicts one of three actions, with confidence and reasons.</p></div>
            <div><h3 className="text-xl font-bold">2. Who should receive it?</h3><p className="mt-2 text-muted-foreground">A matching engine filters and ranks partners using distance, capacity, time left, urgency, responsiveness and fairness.</p></div>
          </div>
          <dl className="mt-10 grid gap-4 md:grid-cols-3">
            {S.actions.map((a) => (
              <div key={a.key} className="panel p-5">
                <dt><span className={`rounded px-2 py-0.5 font-display font-extrabold ${ACTION_TONE[a.key]}`}>{a.key}</span></dt>
                <dd className="mt-3 grid gap-2 text-sm">
                  <p>{a.meaning}</p>
                  <p className="text-muted-foreground"><b className="text-foreground">Typical:</b> {a.situation}</p>
                  <p className="text-muted-foreground"><b className="text-foreground">Goes to:</b> {a.destination}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">Working definitions, open decision A1: to be confirmed with the guide.</p>
        </Section>

        <Section id="how" num="04" title="How it works">
          <ol className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
            {S.workflow.map((w, i) => (
              <li key={w.step} className="grid grid-cols-[2.5rem_1fr] gap-3">
                <span className="font-display text-3xl font-extrabold text-donate">{i + 1}</span>
                <div><h3 className="font-bold">{w.step} <span className="text-xs font-normal text-muted-foreground">({w.mode.toLowerCase()})</span></h3><p className="mt-1 text-sm text-muted-foreground">{w.body}</p></div>
              </li>
            ))}
          </ol>
          <h3 className="mt-12 text-xl font-bold">Donation status lifecycle</h3>
          <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold mono" aria-label="Main path">
            {S.lifecycle.map((s, i) => (
              <li key={s} className="flex items-center gap-2"><span className="rounded border bg-card px-2 py-1">{s}</span>{i < S.lifecycle.length - 1 && <span aria-hidden>→</span>}</li>
            ))}
          </ol>
          <ul className="mt-4 grid gap-1 text-sm text-muted-foreground prose-measure">
            <li>OFFERED → REJECTED or TIMED_OUT → next partner → OFFERED.</li>
            <li>MATCHING → NO_MATCH → fallback action (REDISTRIBUTE channel or UPCYCLE) or EXPIRED.</li>
            <li>Any state before PICKED_UP may go to CANCELLED (donor) or EXPIRED (safe window passed).</li>
            <li>Every transition stores actor, timestamp and reason.</li>
          </ul>
        </Section>

        <Section id="try" num="05" title="Try the action decision">
          <TryIt />
        </Section>

        <Section id="matching" num="06" title="Matching lab: watch the ranking change">
          <MatchingLab />
        </Section>

        <Section id="models" num="07" title="Five models, compared fairly, one picked by rule">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-bold">The five classifiers</h3>
              <ul className="mt-3 grid gap-2 text-sm">
                {S.models.map((m) => <li key={m.name} className="flex justify-between gap-4 border-b pb-2"><span className="font-bold">{m.name}</span><span className="text-right text-muted-foreground">{m.family} · {m.impl}</span></li>)}
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">They span probabilistic, linear, single tree, bagging and boosting: interpretable baselines through strong tabular learners.</p>
              <h3 className="mt-8 font-bold">Evaluation protocol</h3>
              <ul className="mt-3 list-disc pl-5 text-sm">{S.protocol.map((p) => <li key={p}>{p}</li>)}</ul>
              <h3 className="mt-8 font-bold">Deterministic selection rule</h3>
              <ol className="mt-3 list-decimal pl-5 text-sm">{S.selectionRule.map((p) => <li key={p}>{p}</li>)}</ol>
            </div>
            <div>
              <h3 className="font-bold">Why these metrics</h3>
              <dl className="mt-3 grid gap-3 text-sm">
                {S.metricsWhy.map(([k, v]) => <div key={k}><dt className="font-bold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>)}
              </dl>
              <h3 className="mt-8 font-bold">Results</h3>
              <div className="mt-3"><ModelComparison /></div>
            </div>
          </div>
        </Section>

        <Section id="data" num="08" title="Where the data comes from, honestly" ink>
          <div className="grid gap-4 md:grid-cols-3">
            {S.dataLayers.map((l) => (
              <div key={l.id} className="rounded-lg border border-ink-muted/30 p-5">
                <p className="font-display text-2xl font-extrabold text-saffron">{l.id}</p>
                <h3 className="mt-1 font-bold">{l.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{l.source}</p>
                <p className="mt-2 text-sm"><b>Use:</b> {l.use}</p>
                <p className="mt-2 text-sm"><b>Honesty rule:</b> {l.honesty}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg border-2 border-saffron p-5 prose-measure">
            <p className="font-bold">Circularity warning</p>
            <p className="mt-2">If labels come from rules over the same features, tree-based models will recover the rules and score near 100 percent. That would make the five-model comparison meaningless. Mitigation: soft labels, noise, an independently labelled L2 set, and reporting L1 and L2 results side by side.</p>
          </div>
        </Section>

        <Section id="roles" num="09" title="Who uses it, and how it is built">
          <div className="grid gap-4 md:grid-cols-3">
            {S.roles.map((r) => <div key={r.role} className="panel p-5"><h3 className="text-lg font-bold">{r.role}</h3><p className="mt-1 text-sm text-muted-foreground">{r.who}</p><p className="mt-3 text-sm">{r.goals}</p></div>)}
          </div>
          <details className="mt-6">
            <summary className="cursor-pointer font-bold">User stories US1 to US9</summary>
            <ul className="mt-3 grid gap-2 text-sm prose-measure">{S.stories.map(([id, t]) => <li key={id}><b className="mono">{id}</b> {t}</li>)}</ul>
          </details>
          <div className="mt-10"><Architecture /></div>
        </Section>

        <Section id="requirements" num="10" title="22 functional requirements, filterable">
          <p className="prose-measure text-muted-foreground">
            {S.frs.filter((f) => f.p === "M").length} Must, {S.frs.filter((f) => f.p === "S").length} Should and {S.frs.filter((f) => f.p === "C").length} Could requirements, plus non-functional requirements, safety rules and the REST API.
          </p>
          <Link to="/requirements" className="btn btn-primary mt-5">Open the requirements explorer</Link>
        </Section>

        <Section id="roadmap" num="11" title="Build order: P0 to P7">
          <ol className="relative grid gap-6 border-l-2 border-donate pl-6">
            {S.phases.map(([id, what, done]) => (
              <li key={id} className="relative">
                <span className="absolute -left-[2.05rem] top-1 h-4 w-4 rounded-full border-2 border-donate bg-background" aria-hidden />
                <p className="font-display font-extrabold">{id}</p>
                <p>{what}</p>
                <p className="text-sm text-muted-foreground">Done when: {done}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div><h3 className="font-bold">Deliverables</h3><ul className="mt-3 grid gap-2 text-sm">{S.deliverables.map(([id, n, d]) => <li key={id}><b className="mono">{id}</b> {n}: <span className="text-muted-foreground">{d}</span></li>)}</ul></div>
            <div><h3 className="font-bold">Future work</h3><ul className="mt-3 list-disc pl-5 text-sm">{S.futureWork.map((f) => <li key={f}>{f}</li>)}</ul></div>
          </div>
        </Section>

        <Section id="testing" num="12" title="Acceptance scenarios">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead><tr className="border-b-2 border-foreground"><th className="py-2 pr-3">#</th><th className="py-2 pr-3">Scenario</th><th className="py-2">Expected result</th></tr></thead>
              <tbody>{S.acceptance.map(([id, sc, ex]) => <tr key={id} className="border-b align-top"><th scope="row" className="py-2 pr-3 mono">{id}</th><td className="py-2 pr-3">{sc}</td><td className="py-2 text-muted-foreground">{ex}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">A1, A3 and A9 can be checked in the matching lab above.</p>
        </Section>

        <Section id="literature" num="13" title="Literature survey">
          <p className="sim-tag">Titles, authors and years must be verified against the actual papers</p>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {S.literature.map(([t, y, a, m, k]) => (
              <li key={t} className="border-b pb-3 text-sm"><p className="font-bold">{t} <span className="font-normal text-muted-foreground">({y}), {a}</span></p><p className="text-muted-foreground">{m}. {k}.</p></li>
            ))}
          </ul>
        </Section>

        <Section id="open" num="14" title="Open decisions and the team">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead><tr className="border-b-2 border-foreground"><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Question</th><th className="py-2">Default until decided</th></tr></thead>
              <tbody>{S.openDecisions.map(([id, q, d]) => <tr key={id} className="border-b align-top"><th scope="row" className="py-2 pr-3 mono">{id}</th><td className="py-2 pr-3">{q}</td><td className="py-2 text-muted-foreground">{d}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Team</h3>
              <ul className="mt-3 grid gap-1">{S.team.members.map((m) => <li key={m.name}>{m.name} <span className="mono text-muted-foreground">({m.roll})</span></li>)}</ul>
              <p className="mt-4"><b>Guide:</b> {S.team.guide}</p>
              <p className="text-sm text-muted-foreground">{S.team.college}, {S.team.dept}, {S.team.year}</p>
            </div>
            <div className="panel p-5">
              <h3 className="font-bold">For agents</h3>
              <p className="mt-2 text-sm text-muted-foreground">The specification PDF is the single source of truth. Read it before building or changing anything, follow the build order in section 14.2 and the rules in section 16.</p>
              <a href={PDF_URL} download className="btn btn-primary mt-4">Download the spec (PDF)</a>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

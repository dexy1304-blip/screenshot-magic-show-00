function Box({ x, y, w, h, title, lines, tone = "card" }: { x: number; y: number; w: number; h: number; title: string; lines: string[]; tone?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={`var(--${tone})`} stroke="var(--ink)" strokeWidth="2" />
      <text x={x + 12} y={y + 24} fontSize="14" fontWeight="700" fill="var(--ink)">{title}</text>
      {lines.map((l, i) => (
        <text key={l} x={x + 12} y={y + 44 + i * 16} fontSize="12" fill="var(--ink)">{l}</text>
      ))}
    </g>
  );
}

export function Architecture() {
  return (
    <figure className="panel overflow-x-auto p-4">
      <svg viewBox="0 0 760 400" className="min-w-[640px] w-full" role="img"
        aria-label="Architecture: web frontend talks HTTPS JSON to the FastAPI backend, which uses a database, an ML service with model registry, and a matching engine. An offline training pipeline feeds the ML service from the dataset generator, expert labels and feedback data.">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10z" fill="var(--ink)" />
          </marker>
        </defs>
        <Box x={10} y={20} w={200} h={90} title="Web frontend" lines={["React + Leaflet", "donor / ngo / admin views"]} />
        <Box x={280} y={20} w={220} h={90} title="Backend API (FastAPI)" lines={["auth, donations, matching,", "notifications, admin"]} tone="saffron-soft" />
        <Box x={570} y={20} w={180} h={90} title="Database" lines={["PostgreSQL / SQLite"]} />
        <Box x={170} y={170} w={210} h={90} title="ML service (lib)" lines={["preprocess + predict", "model registry"]} tone="donate-soft" />
        <Box x={420} y={170} w={210} h={90} title="Matching engine" lines={["filters + scoring", "fairness, cascade"]} tone="redistribute-soft" />
        <Box x={170} y={300} w={210} h={80} title="Training pipeline" lines={["5 models, CV, eval"]} />
        <text x={400} y={330} fontSize="12" fill="var(--ink)">offline: dataset generator,</text>
        <text x={400} y={346} fontSize="12" fill="var(--ink)">expert labels, feedback data</text>
        <line x1={212} y1={65} x2={278} y2={65} stroke="var(--ink)" strokeWidth="2" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <text x={214} y={56} fontSize="11" fill="var(--ink)">HTTPS/JSON</text>
        <line x1={502} y1={65} x2={568} y2={65} stroke="var(--ink)" strokeWidth="2" markerStart="url(#arr)" markerEnd="url(#arr)" />
        <path d="M390 112 V140 H275 V168" fill="none" stroke="var(--ink)" strokeWidth="2" markerEnd="url(#arr)" />
        <path d="M390 140 H525 V168" fill="none" stroke="var(--ink)" strokeWidth="2" markerEnd="url(#arr)" />
        <line x1={275} y1={298} x2={275} y2={262} stroke="var(--ink)" strokeWidth="2" markerEnd="url(#arr)" />
        <line x1={398} y1={338} x2={382} y2={338} stroke="var(--ink)" strokeWidth="2" markerEnd="url(#arr)" />
      </svg>
      <figcaption className="mt-2 text-sm text-muted-foreground">Redrawn from spec section 6.1.</figcaption>
    </figure>
  );
}

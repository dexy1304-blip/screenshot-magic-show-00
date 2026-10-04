import { Link } from "@tanstack/react-router";
import pdf from "@/assets/spec.pdf.asset.json";
import { team } from "@/content/spec";

export const PDF_URL = pdf.url;

export function SiteHeader() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <nav aria-label="Main" className="wrap flex h-14 items-center justify-between gap-4">
          <Link to="/" className="font-display text-lg font-extrabold">Re<span className="text-donate">Food</span>X</Link>
          <ul className="flex items-center gap-4 text-sm font-bold">
            <li className="hidden sm:block"><a href="/#try" className="hover:text-donate">Try it</a></li>
            <li className="hidden sm:block"><a href="/#matching" className="hover:text-donate">Matching lab</a></li>
            <li><Link to="/requirements" className="hover:text-donate" activeProps={{ className: "text-donate" }}>Requirements</Link></li>
            <li><a href={PDF_URL} download className="btn btn-primary py-1.5 text-sm">Spec PDF</a></li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="band-ink">
      <div className="wrap grid gap-6 py-10 text-sm md:grid-cols-2">
        <div>
          <p className="font-display text-lg font-bold">ReFoodX</p>
          <p className="text-muted-foreground">{team.college}, {team.dept}, {team.year}</p>
        </div>
        <p className="text-muted-foreground md:text-right">
          Everything shown in the browser is a simulated demo with synthetic data. No real results are claimed.
        </p>
      </div>
    </footer>
  );
}

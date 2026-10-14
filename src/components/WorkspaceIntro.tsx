const intros: Record<
  string,
  { eyebrow: string; title: string; description?: string }
> = {
  overview: {
    eyebrow: "Snapshot overview",
    title: "The availability picture.",
    description:
      "Reported stock, listed prices and pharmacy coverage. Start with the evidence, then explore a product or source.",
  },
  catalogue: { eyebrow: "Product catalogue", title: "Find & compare" },
  sources: {
    eyebrow: "Pharmacy network",
    title: "Know your sources.",
    description:
      "Explore captured pharmacy catalogues, see which report stock, and open their product listings.",
  },
  quality: {
    eyebrow: "Evidence & limitations",
    title: "Understand the confidence.",
    description:
      "Understand what the data can support before acting on it. Product matches and reference coverage have limits; collection dates are inferred.",
  },
};
export default function WorkspaceIntro({ view }: { view: string }) {
  const intro = intros[view];
  if (!intro) return null;
  return (
    <header
      className={`workspace-intro ${view === "catalogue" ? "workspace-intro-catalogue" : ""}`}
    >
      <div className="eyebrow">{intro.eyebrow}</div>
      <h1 className="h1">{intro.title}</h1>
      {intro.description && <p className="sub">{intro.description}</p>}
    </header>
  );
}

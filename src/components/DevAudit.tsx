import { useState } from "react";
/** Explicit development control: axe never ships in production. */
export default function DevAudit() {
  const [report, setReport] = useState("Not run");
  return (
    <aside className="dev-audit" aria-label="Development checks">
      <button
        className="btn"
        onClick={async () => {
          setReport("Running…");
          try {
            const { default: axe } = await import("axe-core");
            const result = await axe.run(document, {
              runOnly: {
                type: "tag",
                values: [
                  "wcag2a",
                  "wcag2aa",
                  "wcag21aa",
                  "wcag22aa",
                  "best-practice",
                ],
              },
            });
            setReport(
              JSON.stringify({
                violations: result.violations.map((v) => ({
                  id: v.id,
                  impact: v.impact,
                  description: v.description,
                  nodes: v.nodes.map((n) => ({
                    target: n.target,
                    summary: n.failureSummary,
                  })),
                })),
                incomplete: result.incomplete.map((v) => ({
                  id: v.id,
                  nodes: v.nodes.length,
                })),
                passes: result.passes.length,
              }),
            );
          } catch {
            setReport("Audit failed to run");
          }
        }}
      >
        Run accessibility check
      </button>
      <output aria-live="polite" data-audit-result>
        {report}
      </output>
    </aside>
  );
}

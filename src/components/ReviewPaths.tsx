import { Icon } from "./icons";
type ReviewPath = {
  label: string;
  count: number;
  description: string;
  action: string;
  icon: string;
  tone: "amber" | "cobalt" | "berry";
  onOpen: () => void;
};
export default function ReviewPaths({ items }: { items: ReviewPath[] }) {
  return (
    <section className="review-paths" aria-label="Data review priorities">
      {items.map((item) => (
        <article key={item.label} className="review-path" data-tone={item.tone}>
          <header>
            <span className="section-glyph" data-tone={item.tone}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className="review-path-count mono">
              {new Intl.NumberFormat("en-KE").format(item.count)}
            </span>
          </header>
          <h2>{item.label}</h2>
          <p>{item.description}</p>
          <button className="table-action" onClick={item.onOpen}>
            {item.action}
            <Icon name="right" size={14} />
          </button>
        </article>
      ))}
    </section>
  );
}

import { Icon } from "./icons";
import { n0 } from "./ui.jsx";
export default function CataloguePagination({
  page,
  size,
  total,
  onPage,
}: {
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
}) {
  if (!size || !total) return null;
  const pages = Math.ceil(total / size);
  return (
    <footer className="catalogue-pagination">
      <p>
        <b className="num">
          {n0(page * size + 1)}–{n0(Math.min(total, (page + 1) * size))}
        </b>{" "}
        of <span className="num">{n0(total)}</span>{" "}
        {total === 1 ? "result" : "results"}
      </p>
      <nav aria-label="Product result pages">
        <button
          aria-label="First page"
          disabled={!page}
          onClick={() => onPage(0)}
        >
          <Icon name="first-page" size={18} />
        </button>
        <button
          aria-label="Previous page"
          disabled={!page}
          onClick={() => onPage(page - 1)}
        >
          <Icon name="left" size={18} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = Number(new FormData(e.currentTarget).get("page"));
            if (Number.isInteger(value) && value >= 1 && value <= pages)
              onPage(value - 1);
          }}
        >
          <label>
            <span className="sr-only">Go to page</span>
            <input
              key={`${page}-${size}-${total}`}
              name="page"
              type="number"
              min={1}
              max={pages}
              step={1}
              required
              defaultValue={page + 1}
              inputMode="numeric"
              enterKeyHint="go"
              aria-label="Go to page"
            />
            <span aria-label={`of ${pages} pages`}>
              of <b className="num">{n0(pages)}</b>
            </span>
          </label>
        </form>
        <button
          aria-label="Next page"
          disabled={page + 1 >= pages}
          onClick={() => onPage(page + 1)}
        >
          <Icon name="right" size={18} />
        </button>
        <button
          aria-label="Last page"
          disabled={page + 1 >= pages}
          onClick={() => onPage(pages - 1)}
        >
          <Icon name="last-page" size={18} />
        </button>
      </nav>
    </footer>
  );
}

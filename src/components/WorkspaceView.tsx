import { Component, Suspense, type ReactNode } from "react";
class ViewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty" role="alert">
        <h2 className="h2">This view could not load</h2>
        <p className="sub">
          Reload to try again. Your search and filters remain in the link.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Reload view
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
/** Keep the console usable while a route's presentation loads on intent. */
export default function WorkspaceView({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  return (
    <ViewBoundary key={name}>
      <Suspense
        fallback={
          <p className="catalogue-analysis-loading" role="status">
            Loading {name}…
          </p>
        }
      >
        {children}
      </Suspense>
    </ViewBoundary>
  );
}

import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
const DevAudit = import.meta.env.DEV ? lazy(() => import("./DevAudit")) : null;

/** Native modality provides focus containment, inert background and focus return. */
export default function Modal({
  children,
  className,
  labelledBy,
  onClose,
}: {
  children: ReactNode;
  className: string;
  labelledBy: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previous = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={className}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close.current();
        }
      }}
    >
      {children}
      {DevAudit && new URLSearchParams(location.search).has("audit") && (
        <Suspense fallback={null}>
          <DevAudit />
        </Suspense>
      )}
    </dialog>
  );
}

/** Only browser chrome follows the system preference. The app stays light. */
export function installAdaptiveFavicon() {
  const icon = document.querySelector<HTMLLinkElement>(
    "[data-adaptive-favicon]",
  );
  if (!icon || typeof window.matchMedia !== "function") return;
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    const variant = preference.matches ? "dark" : "light";
    icon.href = `/brand/praesto/praesto-b-favicon-${variant}.svg?v=praesto-2`;
  };
  update();
  preference.addEventListener?.("change", update);
  return () => preference.removeEventListener?.("change", update);
}

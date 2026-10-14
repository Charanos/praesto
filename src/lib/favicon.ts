/** Only browser chrome follows the system preference. The app stays light. */
export function installAdaptiveFavicon() {
  let icon = document.querySelector<HTMLLinkElement>("[data-adaptive-favicon]");
  if (!icon || typeof window.matchMedia !== "function") return;
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => {
    const variant = preference.matches ? "dark" : "light";
    const next = document.createElement("link");
    next.rel = "icon";
    next.type = "image/png";
    next.sizes.value = "32x32";
    next.dataset.adaptiveFavicon = "";
    next.href = `/brand/praesto/praesto-b-favicon-${variant}-32.png?v=praesto-3`;
    // Replacing the node prompts browser chrome to refresh its cached bitmap.
    icon?.replaceWith(next);
    icon = next;
  };
  update();
  preference.addEventListener?.("change", update);
  return () => preference.removeEventListener?.("change", update);
}

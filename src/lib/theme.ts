/**
 * Theme utility — dark mode is restricted to tutorial workspace pages only.
 * All other pages always render in light mode.
 */

/** Routes where dark mode is allowed. */
function isDarkModeRoute(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/tutorial/");
}

export function applyTheme(theme: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  const html = document.documentElement;
  html.classList.remove("light", "dark");

  if (theme === "dark" && isDarkModeRoute()) {
    html.classList.add("dark");
  } else {
    html.classList.add("light");
  }
}

/**
 * Call on route change to enforce light mode outside tutorial pages.
 * If the user navigates from a dark tutorial to the homepage, this
 * flips the class to "light" without touching localStorage.
 */
export function enforceThemeForRoute(): void {
  if (typeof window === "undefined") return;
  const html = document.documentElement;

  if (!isDarkModeRoute()) {
    html.classList.remove("dark");
    if (!html.classList.contains("light")) html.classList.add("light");
  } else {
    // Re-apply the stored preference on tutorial pages
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      html.classList.remove("light");
      html.classList.add("dark");
    }
  }
}

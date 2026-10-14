import type { NavigateFunction } from "react-router-dom";

export function navigateWithTransition(
  navigate: NavigateFunction,
  path: string,
): void {
  const doc = document as unknown as { startViewTransition?: (cb: () => void) => void };

  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(() => navigate(path));
    return;
  }

  navigate(path);
}

/** Fail early when a required part of the static page is missing. */
export function element<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Missing page element: ${selector}`);
  return found;
}

export function elements<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function setText(selector: string, value: string): void {
  element(selector).textContent = value;
}

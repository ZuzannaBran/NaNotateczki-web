/** Fail early when a required part of the static page is missing. */
export function element(selector, root = document) {
    const found = root.querySelector(selector);
    if (!found)
        throw new Error(`Missing page element: ${selector}`);
    return found;
}
export function elements(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}
export function setText(selector, value) {
    element(selector).textContent = value;
}

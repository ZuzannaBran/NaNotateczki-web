import { config } from './config.js';
import { element, elements, setText } from './dom.js';
const pageNames = {
    start: 'Strona główna',
    widgets: 'Widgets',
    pobierz: 'Wypróbuj i pobierz',
    kontakt: 'Kontakt',
};
export function initNavigation() {
    const sidebar = element('#sidebar');
    const shade = element('#mobile-shade');
    const menu = element('#open-menu');
    function close() {
        sidebar.classList.remove('menu-open');
        shade.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
    }
    function open() {
        sidebar.classList.add('menu-open');
        shade.hidden = false;
        menu.setAttribute('aria-expanded', 'true');
    }
    menu.addEventListener('click', open);
    element('#close-menu').addEventListener('click', close);
    shade.addEventListener('click', close);
    document.addEventListener('keydown', event => { if (event.key === 'Escape')
        close(); });
    function route() {
        const hash = decodeURIComponent(location.hash.slice(1)).trim().toLowerCase();
        const name = Object.prototype.hasOwnProperty.call(pageNames, hash) ? hash : 'start';
        elements('.view').forEach(section => {
            const visible = section.id === `page-${name}`;
            section.hidden = !visible;
            section.classList.toggle('is-visible', visible);
        });
        elements('.nav-link').forEach(link => {
            const active = link.dataset.route === name;
            link.classList.toggle('is-active', active);
            if (active)
                link.setAttribute('aria-current', 'page');
            else
                link.removeAttribute('aria-current');
        });
        setText('#section-title', pageNames[name]);
        document.title = `${pageNames[name]} | NaNotateczki`;
        close();
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.addEventListener('hashchange', route);
    route();
    elements('[data-feature]').forEach(link => {
        link.addEventListener('click', () => window.setTimeout(() => {
            const target = document.getElementById(`widget-${link.dataset.feature ?? ''}`);
            if (target && !target.closest('[hidden]'))
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60));
    });
}
export function readTheme() {
    try {
        return localStorage.getItem('nanotateczki-site-theme') === 'dark' ? 'dark' : 'light';
    }
    catch {
        return 'light';
    }
}
export function initTheme(preview, getTheme, setTheme) {
    const button = element('#theme-toggle');
    function apply(theme) {
        setTheme(theme);
        document.documentElement.dataset.theme = theme;
        button.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${theme === 'dark' ? 'sun' : 'moon'}"></use></svg>`;
        button.setAttribute('aria-label', theme === 'dark' ? 'Włącz tryb jasny' : 'Włącz tryb ciemny');
        preview.refreshColors();
        const iframe = element('#flutter-demo-frame');
        if (iframe.getAttribute('src')) {
            const url = new URL(iframe.src);
            if (url.searchParams.get('theme') !== theme) {
                url.searchParams.set('theme', theme);
                iframe.src = url.href;
            }
        }
        try {
            localStorage.setItem('nanotateczki-site-theme', theme);
        }
        catch { /* private mode */ }
    }
    button.addEventListener('click', () => apply(getTheme() === 'dark' ? 'light' : 'dark'));
    apply(getTheme());
}
/** Only official HTTPS URLs or same-origin development HTTP URLs are permitted. */
export function safeUrl(input) {
    if (!input.trim())
        return null;
    try {
        const url = new URL(input, window.location.href);
        if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === window.location.origin))
            return url.href;
    }
    catch { /* malformed URL */ }
    return null;
}
export function initDownloads() {
    function configure(anchor, value, label, fallback) {
        const url = safeUrl(value);
        if (!url) {
            anchor.removeAttribute('href');
            anchor.setAttribute('aria-disabled', 'true');
            anchor.textContent = fallback;
            return false;
        }
        anchor.href = url;
        anchor.removeAttribute('aria-disabled');
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = label;
        return true;
    }
    configure(element('#web-app-link'), config.webAppUrl, 'Otwórz aplikację ↗', 'Wkrótce');
    elements('[data-platform]').forEach(row => {
        const platform = row.dataset.platform;
        if (!platform || !(platform in config.downloads))
            return;
        const available = configure(element('.download-action', row), config.downloads[platform], 'Pobierz ↗', 'Niedostępne');
        element('.availability-label', row).textContent = available ? 'Dostępne' : 'Wkrótce';
    });
}
export async function detectFlutterDemo(theme) {
    try {
        const bootstrap = new URL('demo/flutter_bootstrap.js', location.href);
        const response = await fetch(bootstrap, { method: 'HEAD', cache: 'no-store' });
        if (!response.ok)
            return;
        const iframe = element('#flutter-demo-frame');
        const url = new URL('demo/index.html', location.href);
        url.searchParams.set('theme', theme);
        iframe.src = url.href;
        element('#flutter-demo').hidden = false;
        element('.writing-widget').classList.add('has-flutter');
        setText('#widget-engine-status', 'Oryginalny edytor Flutter');
    }
    catch (error) {
        console.info('Moduł Flutter nie został jeszcze opublikowany.', error);
    }
}

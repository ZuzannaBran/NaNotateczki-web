import { createDrawingPreview } from './drawing.js';
import { initCalendar, initTimer } from './planner.js';
import { element } from './dom.js';
import { detectFlutterDemo, initDownloads, initNavigation, initTheme, readTheme } from './site.js';
function main() {
    let theme = readTheme();
    initNavigation();
    const preview = createDrawingPreview(() => theme);
    initTheme(preview, () => theme, value => { theme = value; });
    initCalendar();
    initTimer();
    initDownloads();
    void detectFlutterDemo(theme);
    element('#copyright-year').textContent = String(new Date().getFullYear());
}
main();

import { element, setText } from './dom.js';
const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
];
/** Demo events, deliberately unrelated to personal planner data. */
const sampleDays = {
    5: 'Wydarzenie', 12: 'Sesja nauki', 19: 'Sesja nauki', 27: 'Wydarzenie',
};
export function initCalendar() {
    const today = new Date();
    let displayed = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = today.getDate();
    const grid = element('#calendar-days');
    function render() {
        const year = displayed.getFullYear();
        const month = displayed.getMonth();
        setText('#calendar-month', `${monthNames[month]} ${year}`);
        grid.replaceChildren();
        const offset = (new Date(year, month, 1).getDay() + 6) % 7;
        const days = new Date(year, month + 1, 0).getDate();
        const cells = Math.ceil((offset + days) / 7) * 7;
        for (let index = 0; index < cells; index++) {
            const day = index - offset + 1;
            const date = new Date(year, month, day);
            const inMonth = day >= 1 && day <= days;
            const number = date.getDate();
            const entry = inMonth ? sampleDays[day] : undefined;
            const isToday = inMonth && year === today.getFullYear() &&
                month === today.getMonth() && day === today.getDate();
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `${number} ${monthNames[date.getMonth()]} ${date.getFullYear()}${entry ? `, przykład: ${entry}` : ''}`);
            if (!inMonth)
                button.classList.add('outside');
            if (isToday)
                button.classList.add('today');
            if (inMonth && selected === day)
                button.classList.add('chosen');
            const label = document.createElement('span');
            label.className = 'calendar-number';
            label.textContent = String(number);
            button.appendChild(label);
            if (entry) {
                const bar = document.createElement('span');
                bar.className = `mini-calendar-entry${day === 12 || day === 27 ? ' alt' : day === 19 ? ' light' : ''}`;
                bar.setAttribute('aria-hidden', 'true');
                button.appendChild(bar);
            }
            button.addEventListener('click', () => {
                displayed = new Date(date.getFullYear(), date.getMonth(), 1);
                selected = number;
                render();
            });
            grid.appendChild(button);
        }
    }
    element('#prev-month').addEventListener('click', () => {
        displayed = new Date(displayed.getFullYear(), displayed.getMonth() - 1, 1);
        selected = null;
        render();
    });
    element('#next-month').addEventListener('click', () => {
        displayed = new Date(displayed.getFullYear(), displayed.getMonth() + 1, 1);
        selected = null;
        render();
    });
    render();
}
/** Pure timer transitions are unit-tested independently of the DOM. */
export function initialTimer(mode) {
    return { mode, phase: 'focus', round: 1, seconds: mode === 'smart' ? 25 * 60 : 50 * 60 };
}
export function timerTick(state) {
    if (state.phase === 'done')
        return state;
    if (state.seconds > 1)
        return { ...state, seconds: state.seconds - 1 };
    if (state.mode === 'smart' && state.phase === 'focus' && state.round === 1) {
        return { ...state, phase: 'break', seconds: 5 * 60 };
    }
    if (state.mode === 'smart' && state.phase === 'break') {
        return { ...state, phase: 'focus', round: 2, seconds: 25 * 60 };
    }
    return { ...state, phase: 'done', seconds: 0 };
}
export function initTimer() {
    const idle = element('#demo-timer-idle');
    const active = element('#demo-timer-active');
    const pomodoro = element('#demo-pomodoro-tag');
    const pauseButton = element('#demo-pause-session');
    let state = null;
    let timerId = null;
    let paused = false;
    function render() {
        if (!state)
            return;
        const minutes = String(Math.floor(state.seconds / 60)).padStart(2, '0');
        const seconds = String(state.seconds % 60).padStart(2, '0');
        setText('#demo-session-time', `${minutes}:${seconds}`);
        setText('#demo-session-phase', state.phase === 'done'
            ? state.mode === 'smart' ? 'Pomodoro · sesja zakończona' : 'Sesja zakończona'
            : state.mode === 'standard' ? 'Focus · 50 min'
                : state.phase === 'break' ? 'Pomodoro · Break 5 min'
                    : `Pomodoro · Focus ${state.round}/2`);
        pauseButton.textContent = paused ? 'Resume' : 'Pause';
        pauseButton.disabled = state.phase === 'done';
    }
    function stop() {
        if (timerId !== null)
            window.clearInterval(timerId);
        timerId = null;
        state = null;
        paused = false;
        pomodoro.hidden = true;
        idle.hidden = false;
        active.hidden = true;
    }
    function start(mode) {
        stop();
        state = initialTimer(mode);
        setText('#demo-session-name', mode === 'smart' ? 'Smart session' : 'Powtórka materiału');
        pomodoro.hidden = mode !== 'smart';
        idle.hidden = true;
        active.hidden = false;
        render();
        timerId = window.setInterval(() => {
            if (!state || paused)
                return;
            state = timerTick(state);
            render();
            if (state.phase === 'done' && timerId !== null) {
                window.clearInterval(timerId);
                timerId = null;
            }
        }, 1000);
    }
    element('#demo-start-session').addEventListener('click', () => start('standard'));
    element('#demo-smart-session').addEventListener('click', () => start('smart'));
    pauseButton.addEventListener('click', () => {
        if (!state || state.phase === 'done')
            return;
        paused = !paused;
        render();
    });
    element('#demo-stop-session').addEventListener('click', stop);
}

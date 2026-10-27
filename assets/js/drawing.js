import { inkColor, isPalette, palettes } from './colors.js';
import { element, elements } from './dom.js';
export function createDrawingPreview(getTheme) {
    const canvas = element('#ink-canvas');
    const sheet = element('#paper-sheet');
    const thickness = element('#pen-size');
    const density = element('#background-density');
    const context = canvas.getContext('2d');
    if (!context)
        throw new Error('Canvas 2D is not supported');
    const strokes = [];
    let active = null;
    let tool = 'pen';
    let palette = 'blue';
    let colorIndex = 0;
    let width = 1;
    let height = 1;
    function paint(stroke) {
        if (!stroke?.points.length)
            return;
        const first = stroke.points[0];
        if (!first)
            return;
        context.save();
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
        context.globalAlpha = stroke.tool === 'highlighter' ? 0.33 : 1;
        const color = stroke.tool === 'eraser' ? '#000' : inkColor(stroke.color, getTheme());
        context.strokeStyle = color;
        context.lineWidth = stroke.tool === 'eraser' ? 24 : stroke.tool === 'highlighter' ? stroke.width * 3.5 : stroke.width;
        context.beginPath();
        context.moveTo(first.x * width, first.y * height);
        if (stroke.points.length === 1) {
            context.lineTo(first.x * width + 0.01, first.y * height + 0.01);
        }
        else {
            for (const point of stroke.points.slice(1))
                context.lineTo(point.x * width, point.y * height);
        }
        context.stroke();
        context.restore();
    }
    function redraw() {
        if (!canvas.width)
            return;
        context.clearRect(0, 0, width, height);
        strokes.forEach(paint);
        paint(active);
    }
    function resize() {
        const box = canvas.getBoundingClientRect();
        if (!box.width || !box.height)
            return;
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        width = box.width;
        height = box.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        redraw();
    }
    function position(event) {
        const box = canvas.getBoundingClientRect();
        return {
            x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)),
            y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)),
        };
    }
    canvas.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0)
            return;
        if (active)
            return;
        canvas.setPointerCapture(event.pointerId);
        const color = palettes[palette][colorIndex];
        if (!color)
            return;
        active = {
            pointerId: event.pointerId,
            tool,
            color,
            width: Number(thickness.value),
            points: [position(event)],
        };
        redraw();
    });
    canvas.addEventListener('pointermove', event => {
        if (active?.pointerId !== event.pointerId)
            return;
        active.points.push(position(event));
        redraw();
    });
    function finish(event) {
        if (!active || active.pointerId !== event.pointerId)
            return;
        if (event.type === 'pointerup')
            strokes.push(active);
        active = null;
        redraw();
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);
    canvas.addEventListener('lostpointercapture', finish);
    element('#clear-ink').addEventListener('click', () => { strokes.length = 0; active = null; redraw(); });
    const toolButtons = elements('[data-tool]');
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            const next = button.dataset.tool;
            if (next !== 'pen' && next !== 'highlighter' && next !== 'eraser')
                return;
            tool = next;
            toolButtons.forEach(item => {
                const selected = item === button;
                item.classList.toggle('active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
        });
        button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
    });
    const swatches = elements('.swatch');
    function selectColor(index) {
        colorIndex = index;
        swatches.forEach((button, i) => {
            button.classList.toggle('current', i === index);
            button.setAttribute('aria-pressed', String(i === index));
        });
    }
    swatches.forEach((button, index) => button.addEventListener('click', () => selectColor(index)));
    function refreshColors() {
        swatches.forEach((button, index) => {
            const hex = palettes[palette][index];
            if (!hex)
                return;
            button.dataset.color = hex;
            button.style.background = inkColor(hex, getTheme());
            button.setAttribute('aria-label', `${palette} — kolor ${index + 1}`);
        });
        redraw();
    }
    elements('.palette-choice').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.palette;
            if (!name || !isPalette(name))
                return;
            palette = name;
            elements('.palette-choice').forEach(item => {
                const selected = item.dataset.palette === palette;
                item.classList.toggle('selected', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            refreshColors();
        });
        button.setAttribute('aria-pressed', String(button.dataset.palette === palette));
    });
    const backgrounds = elements('[data-background]');
    function setBackground(name) {
        sheet.classList.remove('blank', 'grid', 'lines');
        sheet.classList.add(name);
        backgrounds.forEach(button => {
            const selected = button.dataset.background === name;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }
    backgrounds.forEach(button => button.addEventListener('click', () => {
        const name = button.dataset.background;
        if (name === 'blank' || name === 'grid' || name === 'lines')
            setBackground(name);
    }));
    density.addEventListener('input', () => sheet.style.setProperty('--bg-spacing', `${density.value}px`));
    setBackground('lines');
    selectColor(0);
    refreshColors();
    if (typeof ResizeObserver !== 'undefined')
        new ResizeObserver(resize).observe(canvas);
    else
        window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
    return { redraw, refreshColors };
}

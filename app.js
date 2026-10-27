/* NaNotateczki — interactive website previews. No application data is stored. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pageNames = {
    start: 'Strona główna',
    widgets: 'Widgets',
    pobierz: 'Wypróbuj i pobierz',
    kontakt: 'Kontakt'
  };
  const validRoutes = Object.keys(pageNames);
  const sidebar = $('#sidebar');
  const shade = $('#mobile-shade');
  const openMenu = $('#open-menu');
  const themeButton = $('#theme-toggle');
  const palettes = {
    blue: ['#03223A', '#083F69', '#7DADC8'],
    pink: ['#823C44', '#D8798A', '#EAA6AE'],
    green: ['#273526', '#45624E', '#CADFB8']
  };

  function closeNavigation() {
    sidebar.classList.remove('menu-open');
    shade.hidden = true;
    openMenu.setAttribute('aria-expanded', 'false');
  }
  function openNavigation() {
    sidebar.classList.add('menu-open');
    shade.hidden = false;
    openMenu.setAttribute('aria-expanded', 'true');
  }
  openMenu.addEventListener('click', openNavigation);
  $('#close-menu').addEventListener('click', closeNavigation);
  shade.addEventListener('click', closeNavigation);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });

  function route() {
    const id = decodeURIComponent(location.hash.slice(1)).trim().toLowerCase();
    const current = validRoutes.includes(id) ? id : 'start';
    $$('.view').forEach((element) => {
      const shown = element.id === 'page-' + current;
      element.hidden = !shown;
      element.classList.toggle('is-visible', shown);
    });
    $$('.nav-link').forEach((element) => {
      const selected = element.dataset.route === current;
      element.classList.toggle('is-active', selected);
      if (selected) element.setAttribute('aria-current', 'page');
      else element.removeAttribute('aria-current');
    });
    $('#section-title').textContent = pageNames[current];
    document.title = pageNames[current] + ' | NaNotateczki';
    closeNavigation();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', route);
  route();
  $$('[data-feature]').forEach((element) => {
    element.addEventListener('click', () => {
      const destination = 'widget-' + element.dataset.feature;
      window.setTimeout(() => {
        const target = document.getElementById(destination);
        if (target && !target.closest('[hidden]')) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    });
  });

  const inkCanvas = $('#ink-canvas');
  const drawingArea = $('#paper-sheet');
  const ctx = inkCanvas.getContext('2d');
  const strokes = [];
  let currentStroke = null;
  let selectedTool = 'pen';
  let selectedPalette = 'blue';
  let selectedColorIndex = 0;
  let displayWidth = 1;
  let displayHeight = 1;

  // Match AppColors.displayInkColor: invert HSL lightness in dark mode.
  function inkColor(hex) {
    if (document.documentElement.dataset.theme !== 'dark') return hex;
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const high = Math.max(...rgb);
    const low = Math.min(...rgb);
    const delta = high - low;
    let h = 0;
    let s = 0;
    const l = (high + low) / 2;
    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      switch (high) {
        case rgb[0]: h = ((rgb[1] - rgb[2]) / delta) % 6; break;
        case rgb[1]: h = (rgb[2] - rgb[0]) / delta + 2; break;
        default: h = (rgb[0] - rgb[1]) / delta + 4; break;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    return 'hsl(' + h + ' ' + (s * 100) + '% ' + ((1 - l) * 100) + '%)';
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeButton.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-' + (isDark ? 'sun' : 'moon') + '"></use></svg>';
    themeButton.setAttribute('aria-label', isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny');
    $$('.swatch').forEach((button) => {
      button.style.background = inkColor(button.dataset.color);
    });
    redraw();
    const demo = $('#flutter-demo-frame');
    if (demo && demo.getAttribute('src')) {
      const demoUrl = new URL(demo.src);
      const nextTheme = isDark ? 'dark' : 'light';
      if (demoUrl.searchParams.get('theme') !== nextTheme) {
        demoUrl.searchParams.set('theme', nextTheme);
        demo.src = demoUrl.href;
      }
    }
    try { localStorage.setItem('nanotateczki-site-theme', theme); } catch (_) { /* private mode */ }
  }
  let initialTheme = 'light';
  try {
    const saved = localStorage.getItem('nanotateczki-site-theme');
    if (saved === 'dark') initialTheme = 'dark';
  } catch (_) { /* private mode */ }
  themeButton.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  function resizeCanvas() {
    const rect = inkCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    displayWidth = rect.width;
    displayHeight = rect.height;
    inkCanvas.width = Math.round(rect.width * dpr);
    inkCanvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  function applyStroke(stroke) {
    if (!stroke || !stroke.points.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.33 : 1;
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#000' : inkColor(stroke.color);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = stroke.tool === 'eraser' ? 24 : stroke.tool === 'highlighter' ? stroke.width * 3.5 : stroke.width;
    ctx.beginPath();
    const [first, ...remaining] = stroke.points;
    ctx.moveTo(first.x * displayWidth, first.y * displayHeight);
    if (!remaining.length) {
      ctx.lineTo(first.x * displayWidth + .01, first.y * displayHeight + .01);
    } else {
      for (const point of remaining) ctx.lineTo(point.x * displayWidth, point.y * displayHeight);
    }
    ctx.stroke();
    ctx.restore();
  }
  function redraw() {
    if (!ctx || !inkCanvas.width) return;
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    strokes.forEach(applyStroke);
    applyStroke(currentStroke);
  }
  function position(event) {
    const rect = inkCanvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
  }
  inkCanvas.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    inkCanvas.setPointerCapture(event.pointerId);
    currentStroke = {
      pointerId: event.pointerId,
      tool: selectedTool,
      color: palettes[selectedPalette][selectedColorIndex],
      width: Number($('#pen-size').value),
      points: [position(event)]
    };
    redraw();
  });
  inkCanvas.addEventListener('pointermove', (event) => {
    if (!currentStroke || currentStroke.pointerId !== event.pointerId) return;
    currentStroke.points.push(position(event));
    redraw();
  });
  function finishStroke(event) {
    if (!currentStroke || currentStroke.pointerId !== event.pointerId) return;
    if (event.type === 'pointerup') strokes.push(currentStroke);
    currentStroke = null;
    redraw();
  }
  inkCanvas.addEventListener('pointerup', finishStroke);
  inkCanvas.addEventListener('pointercancel', finishStroke);
  inkCanvas.addEventListener('lostpointercapture', finishStroke);
  $('#clear-ink').addEventListener('click', () => {
    strokes.length = 0;
    currentStroke = null;
    redraw();
  });
  $$('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTool = button.dataset.tool;
      $$('[data-tool]').forEach((other) => {
        const active = other === button;
        other.classList.toggle('active', active);
        other.setAttribute('aria-pressed', String(active));
      });
    });
    button.setAttribute('aria-pressed', String(button.dataset.tool === selectedTool));
  });
  function selectColor(index) {
    selectedColorIndex = index;
    $$('.swatch').forEach((button, i) => {
      button.classList.toggle('current', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
  }
  $$('.swatch').forEach((button, index) => button.addEventListener('click', () => selectColor(index)));
  function setPalette(name) {
    if (!palettes[name]) return;
    selectedPalette = name;
    $$('.palette-choice').forEach((button) => {
      const selected = button.dataset.palette === name;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    $$('.swatch').forEach((button, i) => {
      button.dataset.color = palettes[name][i];
      button.style.background = inkColor(palettes[name][i]);
      button.setAttribute('aria-label', name + ' — kolor ' + (i + 1));
    });
    selectColor(selectedColorIndex);
  }
  $$('.palette-choice').forEach((button) => button.addEventListener('click', () => setPalette(button.dataset.palette)));
  function chooseBackground(name) {
    if (!['blank', 'grid', 'lines'].includes(name)) return;
    drawingArea.classList.remove('blank', 'grid', 'lines');
    drawingArea.classList.add(name);
    $$('[data-background]').forEach((button) => {
      const selected = button.dataset.background === name;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  $$('[data-background]').forEach((button) => button.addEventListener('click', () => chooseBackground(button.dataset.background)));
  $('#background-density').addEventListener('input', (event) => {
    drawingArea.style.setProperty('--bg-spacing', event.target.value + 'px');
  });
  chooseBackground('lines');
  setPalette('blue');
  applyTheme(initialTheme);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resizeCanvas).observe(inkCanvas);
  else window.addEventListener('resize', resizeCanvas);
  window.requestAnimationFrame(resizeCanvas);

  const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  const today = new Date();
  let displayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = today.getDate();
  function renderCalendar() {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    $('#calendar-month').textContent = monthNames[month] + ' ' + year;
    const grid = $('#calendar-days');
    grid.replaceChildren();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const count = Math.ceil((offset + days) / 7) * 7;
    const entries = {5: 'Wydarzenie', 12: 'Sesja nauki', 19: 'Sesja nauki', 27: 'Wydarzenie'};
    for (let index = 0; index < count; index++) {
      const day = index - offset + 1;
      const date = new Date(year, month, day);
      const number = date.getDate();
      const inMonth = day >= 1 && day <= days;
      const sameToday = inMonth && year === today.getFullYear() &&
        month === today.getMonth() && day === today.getDate();
      const button = document.createElement('button');
      button.type = 'button';
      const description = inMonth ? entries[day] : null;
      button.setAttribute('aria-label', number + ' ' + monthNames[date.getMonth()] +
        ' ' + date.getFullYear() + (description ? ', przykład: ' + description : ''));
      if (!inMonth) button.classList.add('outside');
      if (sameToday) button.classList.add('today');
      if (inMonth && selectedDate === day) button.classList.add('chosen');
      const label = document.createElement('span');
      label.className = 'calendar-number';
      label.textContent = String(number);
      button.appendChild(label);
      if (description) {
        const bar = document.createElement('span');
        bar.className = 'mini-calendar-entry' +
          (day === 12 ? ' alt' : day === 19 ? ' light' : day === 27 ? ' alt' : '');
        bar.setAttribute('aria-hidden', 'true');
        button.appendChild(bar);
      }
      button.addEventListener('click', () => {
        displayMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        selectedDate = number;
        renderCalendar();
      });
      grid.appendChild(button);
    }
  }
  $('#prev-month').addEventListener('click', () => {
    displayMonth.setMonth(displayMonth.getMonth() - 1);
    selectedDate = null;
    renderCalendar();
  });
  $('#next-month').addEventListener('click', () => {
    displayMonth.setMonth(displayMonth.getMonth() + 1);
    selectedDate = null;
    renderCalendar();
  });
  renderCalendar();

  // Independent timer preview, not part of the Flutter planner or user account.
  let demoInterval = null;
  let demoSeconds = 0;
  let demoPaused = false;
  function updateDemoTime() {
    $('#demo-session-time').textContent =
      String(Math.floor(demoSeconds / 60)).padStart(2, '0') + ':' +
      String(demoSeconds % 60).padStart(2, '0');
    $('#demo-pause-session').textContent = demoPaused ? 'Resume' : 'Pause';
  }
  function stopDemo() {
    if (demoInterval !== null) window.clearInterval(demoInterval);
    demoInterval = null;
    $('#demo-timer-idle').hidden = false;
    $('#demo-timer-active').hidden = true;
  }
  function startDemo(smart) {
    stopDemo();
    demoSeconds = (smart ? 25 : 50) * 60;
    demoPaused = false;
    $('#demo-session-name').textContent = smart ? 'Smart — przykładowy blok' : 'Powtórka materiału';
    $('#demo-session-phase').textContent = smart ? 'Focus · 1/2' : 'Focus';
    $('#demo-timer-idle').hidden = true;
    $('#demo-timer-active').hidden = false;
    updateDemoTime();
    demoInterval = window.setInterval(() => {
      if (demoPaused) return;
      demoSeconds = Math.max(0, demoSeconds - 1);
      updateDemoTime();
      if (demoSeconds === 0) {
        window.clearInterval(demoInterval);
        demoInterval = null;
        $('#demo-session-phase').textContent = 'Przykładowy blok zakończony';
      }
    }, 1000);
  }
  $('#demo-start-session').addEventListener('click', () => startDemo(false));
  $('#demo-smart-session').addEventListener('click', () => startDemo(true));
  $('#demo-pause-session').addEventListener('click', () => {
    if (demoSeconds <= 0) return;
    demoPaused = !demoPaused;
    updateDemoTime();
  });
  $('#demo-stop-session').addEventListener('click', stopDemo);

  // URLs are deliberately absent until an official web build / installer is published.
  // Never fabricate an installation link and never enable javascript: links.
  function resolveSafeUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const url = new URL(raw, window.location.href);
      if (url.protocol === 'https:' || (url.origin === window.location.origin && url.protocol === 'http:')) {
        return url.href;
      }
    } catch (_) { /* invalid link */ }
    return null;
  }
  function configureLink(anchor, configured, activeText, inactiveText) {
    const url = resolveSafeUrl(configured);
    if (!url) {
      anchor.removeAttribute('href');
      anchor.setAttribute('aria-disabled', 'true');
      anchor.textContent = inactiveText;
      return false;
    }
    anchor.href = url;
    anchor.removeAttribute('aria-disabled');
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = activeText;
    return true;
  }
  const config = window.NaNotateczkiConfig || {};
  configureLink($('#web-app-link'), config.webAppUrl, 'Otwórz aplikację ↗', 'Wkrótce');
  $$('[data-platform]').forEach((row) => {
    const key = row.dataset.platform;
    const available = configureLink($('.download-action', row), (config.downloads || {})[key], 'Pobierz ↗', 'Niedostępne');
    $('.availability-label', row).textContent = available ? 'Dostępne' : 'Wkrótce';
  });

  // A real Flutter Web build is published as static output in demo/.
  // Never load the private Dart source or fake Flutter with JavaScript.
  async function activateFlutterDemo() {
    try {
      const bootstrap = new URL('demo/flutter_bootstrap.js', window.location.href);
      const result = await fetch(bootstrap.href, {
        method: 'HEAD',
        cache: 'no-store'
      });
      if (!result.ok) return;

      const iframe = $('#flutter-demo-frame');
      const demoUrl = new URL('demo/index.html', window.location.href);
      demoUrl.searchParams.set(
        'theme',
        document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
      );
      iframe.src = demoUrl.href;
      $('#flutter-demo').hidden = false;
      $('.writing-widget').classList.add('has-flutter');
      $('#widget-engine-status').textContent = 'Oryginalny edytor Flutter';
    } catch (error) {
      // Preview remains usable before the real Flutter bundle is published.
      console.info('Moduł Flutter nie został jeszcze opublikowany.', error);
    }
  }
  void activateFlutterDemo();

  $('#copyright-year').textContent = new Date().getFullYear();
})();
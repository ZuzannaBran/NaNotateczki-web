# NaNotateczki Web

Publiczna strona projektu **NaNotateczki**: prezentacja funkcji, interaktywne widżety oraz odnośniki do oficjalnych wersji aplikacji.

## Uruchomienie

Wymagane: Node.js 20+ i Python 3.

```bash
npm install
npm run check
python3 -m http.server 8000
```

Otwórz `http://localhost:8000`. Polecenie `npm run check` sprawdza typy, kompiluje TypeScript i uruchamia testy. `npm run build` kompiluje `src/*.ts` do `assets/js/*.js`.

## Struktura

- `src/` — kod TypeScript: nawigacja, motywy, rysowanie, kalendarz, timer i pobieranie.
- `assets/js/` — skompilowane moduły ES wersjonowane dla GitHub Pages.
- `index.html`, `style.css` — struktura i wygląd witryny.
- `src/config.ts` — oficjalne linki do aplikacji i instalatorów (puste do czasu publikacji).
- `demo/` — opcjonalny build edytora Flutter; szczegóły w [instrukcji dla Codexa](CODEX_FLUTTER_WIDGET.md).

**Publikacja:** GitHub Pages → Deploy from a branch → `main` / `(root)`. Po zmianach TypeScript uruchom `npm run build` i commituj również wygenerowane pliki w `assets/js/`.

## Licencja

[PolyForm Noncommercial 1.0.0](LICENSE.md) — użytkowanie wyłącznie w ramach dozwolonych zastosowań niekomercyjnych.

© 2026 Zuzanna Baran.

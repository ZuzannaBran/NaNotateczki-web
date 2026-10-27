# NaNotateczki — strona projektu

Oficjalna polskojęzyczna witryna projektu NaNotateczki, przygotowana jako statyczna strona (HTML, CSS, JavaScript) bez zewnętrznych zależności.

## Uruchomienie

Otwórz `index.html` w przeglądarce lub uruchom lokalny serwer HTTP, np. `python3 -m http.server 8000`.

## Konfiguracja publikacji

W pliku `config.js` ustaw adres webowej wersji aplikacji oraz adresy plików instalacyjnych. Dopóki pola są puste, strona wyraźnie pokazuje status „Wkrótce” i nie oferuje fikcyjnych pobrań.

- `webAppUrl`: pełny adres HTTPS opublikowanej wersji przeglądarkowej.
- `downloads.windows`: adres instalatora Windows (.exe lub .msi).
- `downloads.linux`: adres pakietu Linux (.AppImage lub .deb).
- `downloads.android`: adres pliku Android (.apk).
- `downloads.macos`: adres instalatora macOS (.dmg lub .pkg).

Instalatory można umieścić w GitHub Releases repozytorium projektu, a następnie wpisać ich bezpośrednie adresy w `config.js`. Publikacja statyczna może być wykonana przez GitHub Pages z gałęzi `main`, katalog root; trzeba ją włączyć w ustawieniach repozytorium. Strona nie uruchamia GitHub Actions.

## Zawartość

Start, Widgets, Wypróbuj i pobierz, Kontakt. Podgląd pióra w HTML/CSS/JS jest wyświetlany wyłącznie do czasu opublikowania oryginalnej wersji Flutter Web w katalogu \`demo/\`. Pozostałe widżety na stronie są demonstracjami.

Projekt i kontakt: Zuzanna Baran · baran_zuzanna@outlook.com.

## Prawdziwy edytor i pasek narzędzi Flutter

Na stronie Widgets zarezerwowane jest miejsce na rzeczywisty `EditorScreen` i `EditorToolbar` aplikacji Flutter. W prywatnym repozytorium `NaNotateczki` na gałęzi `dev` jest osobny punkt wejścia `tool/website_widget_demo.dart`. Korzysta z oryginalnego silnika odręcznego pisma, narzędzi, gumek, kształtów i tła. Uruchamia niezależną bazę SQLite WASM/IndexedDB `nanotateczki-website-widget-demo-v1` bez konta, API, synchronizacji czy backupu serwerowego.

**Dopóki skompilowany moduł nie trafi do `demo/`, strona nadal pokazuje opisany jako taki podgląd HTML.** Sam skrypt integracji nie jest równoważny opublikowaniu Fluttera.

### Kompilacja lokalna na Ubuntu

Wymagane: Flutter SDK z obsługą Web, dostęp do prywatnego repozytorium i oba repozytoria sklonowane obok siebie.

```bash
cd ~/Dokumenty
git clone https://github.com/ZuzannaBran/NaNotateczki-web.git
git clone -b dev https://github.com/ZuzannaBran/NaNotateczki.git
cd NaNotateczki-web
bash scripts/build-flutter-demo.sh ../NaNotateczki
```

Jeśli repozytoria już istnieją, pomiń `git clone` i zsynchronizuj ich gałęzie przed kompilacją. Skrypt kompiluje projekt prywatny przez `flutter build web --release --target tool/website_widget_demo.dart --base-href /NaNotateczki-web/demo/`, a następnie kopiuje **tylko wyjściowy build** do publicznego `NaNotateczki-web/demo/`. Nie uruchamia GitHub Actions.

Uruchom stronę lokalnie i sprawdź wszystkie narzędzia:

```bash
python3 -m http.server 8000
```

Uwaga: build z powyższym `--base-href` zakłada ścieżkę `/NaNotateczki-web/demo/` na GitHub Pages. Do testowania pod adresem `http://localhost:8000/demo/` skompiluj z `--base-href /demo/`, podając ją jako drugi argument skryptu:

```bash
bash scripts/build-flutter-demo.sh ../NaNotateczki /demo/
```

Następnie na potrzeby publikacji ponownie zbuduj z domyślną ścieżką i wypchnij wynik:

```bash
bash scripts/build-flutter-demo.sh ../NaNotateczki
git add demo
git commit -m "chat: publikacja modułu Flutter Web"
git push origin main
```

Strona wykrywa `demo/flutter_bootstrap.js` i automatycznie zastępuje podgląd HTML osadzonym edytorem. Przełączenie motywu przeładowuje iframe, ale demonstracyjne notatki pozostają w wydzielonej bazie przeglądarki.

**Bezpieczeństwo publikacji:** pliki `tool/*.dart` i pozostały kod źródłowy aplikacji nie powinny trafiać do publicznego repozytorium. Skompilowany JavaScript jest jednak kodem dostępnym dla użytkowników strony i możliwym do analizy; kompilacja nie gwarantuje poufności algorytmów. Nie umieszczaj w kodzie klienta sekretów ani tokenów.

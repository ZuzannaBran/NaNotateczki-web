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

Start, Widgets, Wypróbuj i pobierz, Kontakt. Prezentowane miniatury narzędzi na stronie są demonstracjami wyglądu, a nie uruchomioną aplikacją Flutter.

Projekt i kontakt: Zuzanna Baran · baran_zuzanna@outlook.com.

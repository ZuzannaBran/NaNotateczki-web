# Zadanie dla Codexa — prawdziwy edytor Flutter w zakładce Widgets

## Cel

Dokończ integrację **rzeczywistego silnika i oryginalnego paska narzędzi Flutter** z publiczną stroną wizytówkową **NaNotateczki-web**. Efektem ma być działająca, pomniejszona wersja edytora NaNotateczki w sekcji **Widgets → Pismo i tło strony**, uruchamiana bezpośrednio w przeglądarce.

Nie buduj kolejnej imitacji w HTML Canvas ani nowego paska narzędzi w JavaScript. Muszą działać **istniejące komponenty Flutter z głównej aplikacji**, łącznie z prawdziwym silnikiem obsługi kresek i gestów.

## Repozytoria i gałęzie

| Repozytorium | Dostęp i przeznaczenie | Gałąź |
| --- | --- | --- |
| `ZuzannaBran/NaNotateczki` | Prywatne; oryginalna aplikacja i kod Flutter | `dev` |
| `ZuzannaBran/NaNotateczki-web` | Publiczne; wizytówka i wyłącznie wynikowy build Flutter Web | `main` |

Przykładowy układ na komputerze użytkowniczki:

```text
~/Dokumenty/
├── NaNotateczki/
│   └── NaNotateczki/       ← repo prywatne, źródła Flutter
└── NaNotateczki-web/       ← repo publiczne, strona wizytówkowa
```

Przed pracą w prywatnym repo przeczytaj `CZAT.md`, `PROJECT_MAP.md` oraz — jeśli zmieniasz zapis lub magazynowanie — `data.md`. Nie kopiuj ani nie publikuj prywatnych źródeł w repozytorium webowym. Przed każdą zmianą wykonaj `git status --short --branch`, sprawdź gałąź i zsynchronizuj ją bez nadpisywania cudzych zmian. **Nie uruchamiaj GitHub Actions**, chyba że użytkowniczka wyraźnie o to poprosi.

## Co już przygotowano

### Prywatne NaNotateczki (`dev`)

- `tool/website_widget_demo.dart` — osobny `main()` dla demonstracji. Tworzy lokalny demonstracyjny notatnik, repozytorium Drift/SQLite i `EditorController`; wyświetla oryginalny `EditorScreen` z jego `EditorToolbar`.
- `test/website_widget_demo_test.dart` — początkowe testy struktury pustego notatnika i oddzielnej nazwy bazy danych.
- Oryginalne komponenty: `lib/features/editor/presentation/editor_screen.dart`, `lib/features/editor/presentation/widgets/editor_toolbar.dart`, `lib/features/editor/presentation/widgets/drawing_canvas.dart`, `lib/features/editor/state/editor_controller.dart`.
- Oryginalny motyw: `lib/core/theme/app_colors.dart`, `app_theme.dart` i `app_typography.dart`.

**Uwaga:** poprzedni kod demonstracji został dodany bez wykonania kompilacji Flutter Web. To punkt wyjścia, a **nie potwierdzona działająca implementacja**. Sprawdź i popraw ewentualne problemy kompilacji, inicjalizacji, cyklu życia `EditorController`, zapisu i zachowania w iframe.

### Publiczne NaNotateczki-web (`main`)

- `index.html` — zakładka Widgets, element `#flutter-demo` i ramka `#flutter-demo-frame`; obecny podgląd HTML jest rezerwowy.
- `app.js` — `activateFlutterDemo()` sprawdza przez żądanie `HEAD` plik `demo/flutter_bootstrap.js` i po wykryciu builda pokazuje iframe z `demo/index.html?theme=...`.
- `style.css` — style iframe i ukrywanie symulowanego rysowania po włączeniu Fluttera.
- `scripts/build-flutter-demo.sh` — lokalny skrypt budujący prywatny projekt i kopiujący **wyłącznie wynik kompilacji** do publicznego `demo/`.
- `README.md` — ogólna instrukcja wdrożenia.

## Wymagania funkcjonalne

1. W obrębie sekcji „Pismo i tło strony” wyświetl **autentyczny, reagujący na interakcje edytor Flutter**, a nie zrzut ekranu czy atrapę.
2. Użyj **oryginalnego `EditorToolbar`** ze wszystkimi narzędziami wspieranymi przez ten edytor: pióro, zakreślacz, gumki, kształty, tekst, zaznaczanie/lasso, przesuwanie, tło strony, szybkie kolory, szerokość kreski, cofanie i ponawianie. Obsłuż dostępne akcje w sposób bezpieczny; nie zostawiaj pozornie aktywnych przycisków, które niczego nie robią.
3. Pismo ma korzystać z istniejącego renderingu Flutter, logiki stroke'ów, nacisku i gestów. Sprawdź mysz, rysik, palec, zmianę rozmiaru ramki oraz zachowanie przy skalowaniu.
4. Zachowaj dokładnie oryginalny wygląd aplikacji: **Georgia**, `AppTheme`, kolory `AppColors`, zaokrąglenia, ikony Material, odstępy i obrys toolbaru. Nie projektuj nowego stylu.
5. Pomniejszenie ma dotyczyć **obszaru osadzenia**, a nie geometrii zapisanych kresek. Pasek musi pozostać dostępny także przy małej szerokości; użyj mechanizmów responsywności/poziomego przewijania już obecnych w Flutter.
6. Pokazuj jedną kartkę z możliwością rysowania, czyszczenia i zmiany tła (gładkie, linie, kratka). Możesz zachować inne standardowe funkcje oryginalnego edytora, jeśli nie naruszają izolacji demonstracji.
7. Zadbaj o tryb jasny/ciemny zgodny ze stroną i aplikacją. Nie wczytuj prywatnych preferencji użytkownika ani danych konta.
8. **Bez logowania, sieciowego API, zdalnego backupu i synchronizacji.** Nie otwieraj istniejącej biblioteki użytkownika. Wszystkie dane demo muszą być odseparowane od danych właściwej aplikacji.
9. Zachowaj polski język tekstów samej witryny. Nie modyfikuj na siłę wszystkich tekstów wewnętrznych narzędzi Flutter, jeśli wymagałoby to zmian w interfejsie głównej aplikacji.

## Izolacja i bezpieczeństwo

Sama oddzielna nazwa bazy SQLite/IndexedDB **nie gwarantuje pełnej izolacji**: `localStorage` jest współdzielony przez strony w tym samym origin, a kontroler edytora może używać wspólnych kluczy preferencji. Przeanalizuj to i zapewnij osobne klucze/przestrzeń danych demo albo zastosuj oddzielny origin. Unikaj zmian globalnych preferencji i ryzyka nadpisania danych pełnej aplikacji Web. Sprawdź także zamykanie bazy, zapisów asynchronicznych i stan `dispose()` — bez `setState() after dispose` i bez utraty ostatnich kresek.

Nie publikuj w repo publicznym plików Dart, `.env`, tokenów, danych użytkownika ani plików źródłowych całego prywatnego repo. Publicznie umieszczaj wyłącznie artefakty potrzebne do uruchomienia kompilacji Web. **Ważne:** skompilowany JavaScript można analizować, więc nie zakładaj, że sam build ukrywa algorytmy lub sekrety.

## Zadania techniczne do wykonania

1. Sprawdź stan `dev` i `main` na dysku, zwłaszcza obecność `tool/website_widget_demo.dart`. W poprzedniej próbie kompilacji skrypt zwrócił:
   ```text
   Brak źródeł demonstracji: .../tool/website_widget_demo.dart
   ```
   To może oznaczać niezaktualizowane lokalne `dev` albo niewłaściwą ścieżkę, a nie brak pliku na GitHubie. Najpierw sprawdź `git branch --show-current`, `git status`, `git pull --ff-only origin dev` (jeśli bezpieczne) i ścieżkę przekazaną skryptowi.
2. Zweryfikuj wymagane zależności i przeglądarkową kompilację `tool/website_widget_demo.dart`. Napraw rzeczywiste błędy kompilacji i uruchamiania bez tworzenia nowego silnika.
3. Sprawdź inicjalizację Drift/SQLite Web: `sqlite3.wasm`, `drift_worker.dart.js`, ścieżki URL po zmianie `base-href`, trwałość danych demo i możliwość działania po odświeżeniu.
4. Uruchom prawdziwy `EditorToolbar` w iframe, sprawdź jego wszystkie interakcje i ewentualne ograniczenia uprawnień przeglądarki (schowek, wstawianie plików, eksport). Widoczny toolbar nie może być jedynie dekoracją.
5. Sprawdź pozycjonowanie kartki, uchwytów, menu narzędzi, popupów, gesty oraz rozmiar iframe na desktopie i telefonie. Jeśli małe osadzenie jest niewygodne, dodaj opcję powiększenia demonstracji do pełnego widoku bez zmiany samego edytora.
6. Dopilnuj, aby integracja w `app.js` nie pokazywała pustej ramki po samym istnieniu `flutter_bootstrap.js`. Sprawdź faktyczną gotowość uruchomionego Fluttera albo pokaż czytelny stan błędu i przycisk ponowienia; podgląd HTML zachowaj do czasu skutecznego startu.
7. Nie zmieniaj zbędnie sekcji Strona główna, Wypróbuj i pobierz ani Kontakt. Nie podawaj fikcyjnych adresów do instalatorów.
8. Gdy demonstracja zostanie sprawdzona, usuń lub wyłącz symulację HTML z sekcji „Pismo i tło strony” w sposób, który nie blokuje poprawnego komunikatu o błędzie przy awarii Fluttera.

## Kompilacja i uruchamianie

Przykładowe polecenia w opisanym wyżej układzie katalogów:

```bash
# Źródła Flutter powinny być na dev
cd ~/Dokumenty/NaNotateczki/NaNotateczki
git status --short --branch
git switch dev
git pull --ff-only origin dev
test -f tool/website_widget_demo.dart

# Strona publiczna — na main
cd ~/Dokumenty/NaNotateczki-web
git status --short --branch
git switch main
git pull --ff-only origin main

# Lokalny build do testu pod http://localhost:8000/demo/
bash scripts/build-flutter-demo.sh ~/Dokumenty/NaNotateczki/NaNotateczki /demo/
python3 -m http.server 8000
```

Sprawdź w przeglądarce `http://localhost:8000/#widgets` i `http://localhost:8000/demo/`. Nie wystarczy otworzyć `index.html` przez `file://` — moduł Web wymaga serwera HTTP.

**Po przejściu testów**, zbuduj wersję z poprawnym prefiksem GitHub Pages:

```bash
cd ~/Dokumenty/NaNotateczki-web
bash scripts/build-flutter-demo.sh \
  ~/Dokumenty/NaNotateczki/NaNotateczki \
  /NaNotateczki-web/demo/
```

Docelowa ścieżka publikacji: `https://zuzannabran.github.io/NaNotateczki-web/demo/` (zakłada włączony GitHub Pages).

## Kryteria ukończenia

- [ ] `flutter build web --release` dla dedykowanego punktu wejścia kończy się poprawnie.
- [ ] Oryginalny edytor, **oryginalny toolbar Flutter** oraz kartka widoczne i działające na stronie.
- [ ] Pióro, zakreślacz, gumka, kolory, tło, cofanie/ponawianie, kształty i gesty sprawdzone ręcznie; pozostałe dostępne akcje obsłużone, a ograniczenia jawnie oznaczone.
- [ ] Brak błędów konsoli, problemów z zasobami WASM i niedziałających żądań `404`.
- [ ] Brak dostępu demonstracji do danych, konta i synchronizacji zwykłej aplikacji; preferencje również odseparowane.
- [ ] Działanie sprawdzone po odświeżeniu, przy zmianie motywu i rozmiaru okna, także na telefonie.
- [ ] Testy powiązanych zmian oraz analiza Darta uruchomione lokalnie; dodane testy regresyjne dla naprawianych usterek.
- [ ] Do publicznego `main` trafiają tylko potrzebne pliki witryny i skompilowany `demo/`; prywatny kod źródłowy zostaje wyłącznie w `dev`.
- [ ] Oba repozytoria mają odpowiednie commity i push; w raporcie końcowym podano hashe, zakres zmian i wyniki testów.
- [ ] **Nie uruchomiono GitHub Actions.**

W przypadku blokady technicznej wyraźnie opisz, co nie działa, zachowaj dotychczas funkcjonalną stronę i **nie przedstawiaj niewdrożonego modułu jako gotowego**.

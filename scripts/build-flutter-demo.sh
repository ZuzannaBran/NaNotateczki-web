#!/usr/bin/env bash
set -euo pipefail

# Run locally. Requires Flutter, access to the private NaNotateczki repo,
# and the public NaNotateczki-web checkout. No GitHub Actions are used.
WEB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_ROOT="${1:-"${WEB_ROOT}/../NaNotateczki"}"
BASE_HREF="${2:-/NaNotateczki-web/demo/}"

if [[ ! -f "${APP_ROOT}/tool/website_widget_demo.dart" ]]; then
  echo "Brak źródeł demonstracji: ${APP_ROOT}/tool/website_widget_demo.dart" >&2
  exit 1
fi
if ! command -v flutter >/dev/null 2>&1; then
  echo "Nie znaleziono Flutter SDK. Zainstaluj Flutter i dodaj go do PATH." >&2
  exit 1
fi

case "${BASE_HREF}" in
  /*/) ;;
  *) echo "Base href musi zaczynać i kończyć się ukośnikiem: /.../" >&2; exit 1 ;;
esac

(
  cd "${APP_ROOT}"
  flutter pub get
  flutter build web \
    --release \
    --target tool/website_widget_demo.dart \
    --base-href "${BASE_HREF}"
)
mkdir -p "${WEB_ROOT}/demo"
cp -R "${APP_ROOT}/build/web/." "${WEB_ROOT}/demo/"

echo "Zbudowany moduł Flutter znajduje się w ${WEB_ROOT}/demo"
echo "Sprawdź lokalnie, a następnie dodaj TYLKO pliki z demo/ do repo publicznego."
echo "Przykład: git add demo && git commit -m 'chat: publikacja widgetu Flutter' && git push origin main"

## EcoTrack Release

Die veroeffentlichbare Version liegt im Ordner `out/`.

So kannst du sie weitergeben:

1. Lade den kompletten Inhalt von `out/` bei einem Static-Hoster hoch.
2. Geeignet sind zum Beispiel Netlify, Vercel (als Static Site), GitHub Pages oder normaler Webspace.
3. Alternativ kannst du die ZIP-Datei `ecotrack-public-release.zip` verschicken.

## GitHub Pages

Die GitHub-Pages-Konfiguration ist vorbereitet:

1. Lege daraus ein GitHub-Repository an.
2. Push den Stand auf den Branch `main`.
3. Aktiviere in GitHub unter `Settings -> Pages` die Quelle `GitHub Actions`.
4. Danach deployed der Workflow `.github/workflows/deploy-github-pages.yml` automatisch.

Die Seite ist dann unter folgendem Schema erreichbar:

`https://DEIN-NAME.github.io/REPO-NAME/`

Wichtig:

- Die App ist eine statische Browser-App.
- Nutzerdaten werden aktuell nur im `localStorage` des jeweiligen Browsers gespeichert.
- Jeder Nutzer hat daher seine eigenen lokalen Daten.
- Fuer einen direkten Aufruf per Doppelklick auf `index.html` ist ein Webserver empfehlenswert.

# Seeding Referenzdaten

Dieses Seeding erzeugt eine nachvollziehbare Referenzhistorie fuer die EcoTrack-Web-App: echte Nutzerprofile, 14 Tage Nutzung und alltagsnahe nachhaltige Aktivitaeten statt rein zufaelliger Testdaten.

## Welche Nutzer angelegt oder aktualisiert werden

Der Seed arbeitet mit allen explizit genannten Personen. In der Anforderung steht zwar einmal "5 Testuser", die Namensliste ergibt aber 6 Profile. Deshalb werden diese 6 Nutzer gepflegt:

- **Jens Ammann** - `ammann-jens@web.de` - Markt Indersdorf - laendlicher Alltag, haeufiger Fahrgemeinschaften und gebuendelte Autofahrten
- **Jan Ammann** - `ammann.jan@web.de` - Dachau - S-Bahn, Fahrrad und Homeoffice-Mix
- **Elijah Stauss** - `elijah.stauss@gmail.com` - Muenchen - Fahrrad, U-Bahn und Mehrweg-Routine
- **Moritz Kaltenstadler** - `moritz.kaltenstadler@gmail.com` - Freising - Regionalzug, Fahrrad und gelegentliche Autofahrten
- **Jana Ammann** - `jana.ammann@test.de` - Muenchen - geboren am 17.08.1998, daraus aktuell Alter `27`
- **Lisa Ammann** - `lisa.ammann@test.de` - Muenchen - geboren am 18.08.2000, daraus aktuell Alter `25`

## Was der Seed macht

1. Vorhandene Nutzer mit diesen E-Mail-Adressen werden gefunden und fuer die Seed-Daten verwendet.
2. Fehlende Nutzer werden neu angelegt.
3. Bei allen Referenznutzern wird `surveySurveyCompleted` auf `true` gesetzt.
4. Fuer diese Nutzer werden vorhandene `activityEntries` geloescht.
5. Anschliessend werden fuer jeden Nutzer 14 Tage plausible Aktivitaeten eingespielt.
6. Der Community-Chat wird mit realistisch wirkenden Nachrichten vorbefuellt.
7. Es werden offene Anfragen fuer neue Aktivitaeten angelegt.
8. Einige bereits freigegebene Custom-Aktivitaeten werden mit gespeichert.
9. Zusaetzlich wird der Activity-Katalog fuer die verwendeten Aktivitaeten mit gepflegt.

## Bestehende Profildaten

Die bereits registrierten Nutzer **Jens Ammann**, **Jan Ammann**, **Elijah Stauss** und **Moritz Kaltenstadler** behalten ihre vorhandenen Stammdaten.

- Vorhandene Angaben wie Name, Wohnort, Alter und bisherige Profildaten werden nicht ueberschrieben.
- Vorhandene Passwoerter werden ebenfalls nicht ueberschrieben.
- Falls einer dieser vier Nutzer auf dem jeweiligen Deployment noch gar nicht existiert, wird er vom Seed nicht kuenstlich neu angelegt.
- Der Seed nutzt diese bestehenden Profile nur als Basis fuer Aktivitaeten, Chat, Requests und den gesetzten Umfrage-Status.
- Neu gepflegt oder sicher gesetzt werden bei diesen Nutzern nur die Referenzdaten rund um die Demo-Nutzung.

Jana und Lisa bleiben dagegen bewusst als Seed-Testaccounts erhalten und werden bei Bedarf mit dem Passwort `test123` angelegt.

## Welche Logik hinter den Aktivitaeten steckt

Die Historie ist absichtlich nicht zufaellig, sondern personenspezifisch:

- Stadtprofile in Muenchen nutzen haeufiger Fahrrad, OePNV und Fusswege.
- Nutzer aus dem Umland oder laendlichen Raum haben mehr Fahrgemeinschaften, gebuendelte Autofahrten oder einzelne kombinierte Wege.
- Homeoffice taucht nur bei Profilen auf, bei denen das im Alltag plausibel ist.
- Ernaehrung, Haushalt und individuelle Nachhaltigkeitsaktionen sind ueber die zwei Wochen verteilt und wiederholen sich nachvollziehbar.
- Wochenenden unterscheiden sich von Werktagen und enthalten eher Marktbesuche, Freizeitwege, Vorkochen oder Reparaturen.
- Die Chat-Nachrichten greifen genau diese Unterschiede auf, damit die Community-Ansicht nicht leer wirkt.
- Die Aktivitaetsanfragen passen zum Projektkontext und fuehlen sich wie echte Vorschlaege der Testnutzer an.

## Standard-Passwort

Alle 6 Referenznutzer werden auf dieses Passwort gesetzt:

`test123`

## Seed ausfuehren

```bash
npx convex run seed:seedData
```

## Wichtiger Hinweis zu Convex CLI Argumenten

Bei Queries oder Mutations mit Argumenten musst du die Parameter als JSON uebergeben. Das funktioniert zum Beispiel so:

```bash
npx convex run activityTracking:getUserEntries '{"userId":"j973728q5vk0ysdfc0tggew4xs82kb9m"}' --prod
```

Ohne JSON-Objekt versucht Convex den Wert direkt zu parsen und wirft den Fehler aus deinem Screenshot.

## Nach dem Seeding pruefen

- Mit einem der Testaccounts einloggen
- Im Dashboard die Aktivitaeten der letzten 14 Tage ansehen
- Die Unterschiede zwischen Stadt- und Landprofilen vergleichen
- Den Community-Chat und die eingereichten Aktivitaetsanfragen pruefen
- Die bereits freigegebenen Zusatzaktivitaeten im Katalog ansehen
- Export oder Auswertung fuer deine Arbeit auf Basis dieser Referenzdaten machen

## Idempotenz

- Der Seed erzeugt keine doppelten Nutzer mit denselben E-Mail-Adressen.
- Bei erneutem Ausfuehren werden die 14 Tage Aktivitaeten fuer diese Referenznutzer sauber neu aufgebaut.
- Andere Nutzer bleiben unberuehrt, solange ihre E-Mail-Adressen nicht zu den Seed-Profilen gehoeren.

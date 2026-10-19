# Briefing für Claude Designer: Einkaufsliste im Wochenplan

## Worum geht es
Der „Wochenplan“ ist eine mobile Web-App (iPhone-PWA, max. 480 px breit) für einen 4-Wochen-Essensplan. Neu kommt eine **Einkaufsliste**: Aus den Gerichten der gewählten Wochen entstehen Kacheln mit den Zutaten, die man per Wischen löscht oder in einen **Einkaufswagen** schiebt. Gestaltet werden soll nur das Frontend, die Daten kommen aus dem Backend (siehe unten).

## Bestehender Look (bitte beibehalten)
- Warme, ruhige Küchen-Optik: Creme-Hintergrund, dunkles Tannengrün, Amber als Akzent, runde Ecken (Karten ~18 px, Sheets 28 px, Buttons rund).
- Schriften: **Newsreader** (Serif) für Titel und Namen, **DM Sans** für Fließtext.
- Farben (Hell / Dunkel): Seite `#FFF9E2` / `#1A3637`, Text `#1A3637` / `#FFF9E2`, Karte `#FFFDF2` / `#40534D`, Akzent Amber `#D98A3D`, Gefahr `#A8452F` / `#E8A18F`. Dark Mode ist Pflicht, auch der Wechsel Auto/Hell/Dunkel.
- Vollbild-Fenster („Gedanken“) als Vorbild: grüner Kopf mit Blätter-Foto, Zurück-Pfeil, großer Serif-Titel, darunter die Liste, unten eine feste Eingabeleiste mit rundem Plus-Button.
- Icons: Linien-Icons, 1,5 px Strichstärke.

## Bildschirme

1. **Header-Taste „Einkaufsliste“**: neues rundes Icon (Einkaufskorb) links neben dem Gedanken-Button im Header.
2. **Auswahl-Sheet „Einkaufsliste erstellen“** (Bottom-Sheet): vier Optionen zur Wahl (eine ausgewählt): *Diese Woche*, *Nächste Woche*, *Diese + nächste*, *Alle 4*. Voreinstellung „Diese“. Primärer Button „Erstellen“. Dazu ein Zustand „Keine Zutaten gefunden“.
3. **Einkaufsliste (Vollbild-Fenster)**:
   - Kacheln mit Zutat und Tagen, z. B. **Reis · 2 Tage**, **Pute · 1 Tag**. Eigene Einträge (z. B. „Kaffee“) haben keine Tage.
   - Kacheln sind nach Erzeugung gruppiert. Jede Gruppe hat eine Überschrift (z. B. „Woche 2 · 8.6.–14.6.“) und **deutlichen Abstand zur vorherigen Gruppe**, damit man sieht, was zu welcher Woche gehört. Eigene Einträge stehen unter „Eigene Einträge“.
   - **Wischen nach links = löschen:** Der Kachelhintergrund färbt sich dabei **animiert rot** (Deckkraft wächst mit dem Wischweg), Papierkorb-Icon erscheint. **Wischen nach rechts = in den Einkaufswagen:** Hintergrund wird **animiert grün**, Einkaufswagen-Icon erscheint. Nach dem Auslösen gleitet die Kachel hinaus, sonst federt sie zurück.
   - **Antippen** öffnet ein Bearbeiten-Sheet (Name, Anzahl Tage, Speichern/Abbrechen).
   - Eingabeleiste unten („z. B. Kaffee“) mit rundem Plus-Button.
   - Leerzustand: „Die Einkaufsliste ist leer.“
4. **Einkaufswagen (Vollbild-Fenster)**: gleiche Kacheln, aber ohne Wischen. Oben oder unten ein klarer Knopf **„Wagen leeren“** (Gefahr-Stil, löscht alles auf einmal nach Rückfrage). Leerzustand: „Der Einkaufswagen ist leer.“
5. **Drei-Punkte-Menü**: neuer Eintrag **„Einkaufswagen“** mit einer **Zahl** (Anzahl Kacheln im Wagen), ausgeblendet bei 0.

## Wichtig für die Umsetzung
- Reines HTML/CSS/JS in einer `index.html`, keine Frameworks (kein React/Tailwind). Bitte als HTML + CSS liefern, gern mit den vorhandenen CSS-Variablen.
- Touch-Ziele mindestens 44 px, vertikales Scrollen darf durch das Wischen nicht blockiert werden.
- Alle Texte deutsch.

## Daten, an die das Frontend andockt (Backend ist gebaut)
Eine Zeile pro Kachel: `{ id, name, tage (Zahl oder leer), im_wagen (true/false), charge (Gruppen-Überschrift) }`.
Funktionen: `einkauf` (Array aller Zeilen), `loadEinkauf()`, `addEinkaufBatch(items, charge)`, `updateEinkauf(id, patch)`, `deleteEinkauf(id)`, `leereWagen()`, `updateWagenBadge()`, `erstelleEinkauf(start, anzahl)`. Die Render-Funktionen `renderEinkauf()` und `renderWagen()` schreibt das Frontend.

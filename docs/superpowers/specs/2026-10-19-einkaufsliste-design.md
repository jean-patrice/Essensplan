# Einkaufsliste & Einkaufswagen – Design

## Ziel
Aus dem 4-Wochen-Essensplan soll per Tastendruck eine Einkaufsliste entstehen. Sie zeigt pro Zutat, an wie vielen Tagen sie gebraucht wird („Reis · 2 Tage“). Kacheln lassen sich per Wischen löschen (links) oder in einen Einkaufswagen schieben (rechts).

**Warum:** Der Nutzer will beim Einkaufen nicht den Plan durchblättern, sondern abhaken. Gramm-Mengen interessieren nicht, nur „was brauche ich diese Woche“.

## Nicht-Ziele
- Gramm-Mengen zusammenrechnen
- Einzelne Tage/Gerichte auswählen (nur ganze Wochen)
- Kategorien, Sortierung nach Supermarkt-Gang
- Zusammenführen gleicher Zutaten über Wochen-Gruppen hinweg
- Neue Bibliotheken oder Build-Tooling

## Rahmen (Bestand)
Einzelne `index.html` (HTML/CSS/JS), Supabase-Client per CDN, Daten pro Gruppe (`currentGroup.id`), iPhone-PWA. Vollbild-Fenster-Muster existiert bereits (`.page`, `openGedanken()` / `closePage()`). Zutaten stehen nur als Freitext in `essensplan.mengen`, z. B. „400 g Pute, 600 g Kartoffeln, 2 Paprika“.

## Ablauf
1. **Neue Taste** im Header neben dem Gedanken-Button öffnet ein Auswahl-Sheet.
2. **Wochenauswahl:** „Diese“, „Nächste“, „Diese + nächste“. „Alle 4“ ist eine Zusatzoption (Entscheidung des Designers, leicht streichbar). Voreinstellung: „Diese“.
3. **Erzeugen:** Für jeden Eintrag der gewählten Wochen wird `mengen` an Kommas geteilt, vorne Zahl und Einheit entfernt (`g`, `kg`, `ml`, `l`, `EL`, `TL`, `Stück`; Zahl ohne Einheit wie „2 Paprika“ ebenfalls), der Rest ist der Zutatenname. Pro Name werden die Tage gezählt (ein Tag zählt pro Eintrag einmal).
4. **Liste** öffnet sich in einem neuen Vollbild-Fenster (Muster Gedanken, Zurück-Pfeil).

## Liste
- Kachel: Name + „N Tag(e)“.
- **Wischen links** → löschen, Kachelhintergrund animiert rot.
- **Wischen rechts** → in den Einkaufswagen, Hintergrund animiert grün.
- **Antippen** → Bearbeiten (Name, Tage).
- **Eigene Einträge** von Hand hinzufügbar (z. B. „Kaffee“, ohne Tage).
- **Neue Erzeugung hängt unten an** die bestehende Liste an, abgesetzt durch Abstand und eine Überschrift („Woche N · Datumsbereich“). Gleiche Zutaten aus verschiedenen Erzeugungen bleiben getrennt.

## Einkaufswagen
- Eintrag im Drei-Punkte-Menü des Hauptbildschirms, mit Zahl = Anzahl Kacheln im Wagen (Badge, wie beim Gedanken-Button).
- Eigene Ansicht im Vollbild-Muster, listet die Kacheln.
- Knopf **„Wagen leeren“** löscht alles auf einmal, mit Rückfrage. Kein Einzel-Wischen im Wagen (Wunsch des Nutzers: „alles auf einmal“).

## Speicherung (Designer-Entscheidung)
Neue Supabase-Tabelle `einkaufsliste` pro Gruppe, geliefert als SQL-Datei im Stil von `supabase_push_subscriptions.sql` (RLS-Policy wie dort). Felder: `id`, `gruppe_id`, `name`, `tage`, `im_wagen` (bool), `charge` (Text für die Überschrift, z. B. „Woche 2 · 8.–14. Juni“), `erstellt_am`. Beide Nutzer der Gruppe sehen denselben Stand. Offline-Cache in `localStorage` analog zu Gedanken ist wünschenswert, aber nachrangig.

## Technik (Designer-Entscheidung)
- Alles in `index.html`, kein neues Framework.
- Wischen per Touch-Events (`touchstart/move/end`) selbst gebaut; vertikales Scrollen darf nicht blockiert werden (Richtungserkennung wie beim vorhandenen Wochen-Swipe).
- Optik an Vorhandenem orientieren (Variablen, Dark Mode, Gedanken-Kacheln). Der Nutzer sucht ggf. eine Vorlage auf 21st.dev (React) und liefert sie nach; sie dient nur als Look-Vorlage.

## Dem Builder überlassen
Genaues Aussehen der Kacheln, Animationsdauer und Schwelle für das Auslösen des Wischens, Texte, Icon der neuen Taste, Umgang mit leerer Liste, Fehlermeldungen bei Supabase-Fehlern.

## Offene Annahmen zum Gegenlesen
- „Alle 4“ als zusätzliche Wochenauswahl.
- Eigene Einträge ohne Tage-Angabe.
- Tabelle heißt `einkaufsliste`, SQL wird vom Nutzer einmal im Supabase-SQL-Editor ausgeführt.

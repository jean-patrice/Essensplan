# Einkaufsliste & Einkaufswagen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per Header-Taste eine Einkaufsliste („Reis · 2 Tage“) aus gewählten Wochen erzeugen, Kacheln per Wischen löschen/in den Wagen schieben, Wagen im Drei-Punkte-Menü mit Zähler.

**Architecture:** Alles in `index.html` (kein Build, keine neuen Bibliotheken). Reine Logik (Zutaten parsen/zählen) liegt zwischen Markern `// <einkauf-pure>` … `// </einkauf-pure>` und wird von einem Node-Test aus der HTML-Datei herausgeschnitten und geprüft. Daten in neuer Supabase-Tabelle `einkaufsliste` pro Gruppe. Neue Vollbild-Fenster nutzen die vorhandene `.page`-Klasse (Muster Gedanken).

**Tech Stack:** HTML/CSS/JS, `@supabase/supabase-js@2` (vorhanden), Node ≥ 20 `node:test` nur für den Logik-Test.

**Spec:** `docs/superpowers/specs/2026-10-19-einkaufsliste-design.md`

## Global Constraints

- Nur ganze Wochen auswählbar: „Diese“, „Nächste“, „Diese + nächste“, „Alle 4“; Voreinstellung „Diese“.
- Keine Gramm-Summen; nur Zutatenname + Tage („N Tag“ / „N Tage“).
- Wischen links = löschen (Hintergrund animiert rot), rechts = in den Wagen (animiert grün). Antippen = bearbeiten (Name, Tage).
- Neue Erzeugung wird unten angehängt, mit Abstand und Überschrift „Woche N · D.M.–D.M.“; gleiche Zutaten aus verschiedenen Erzeugungen werden nicht zusammengeführt.
- Wagen: Eintrag im Drei-Punkte-Menü mit Zahl der Kacheln im Wagen; Knopf „Wagen leeren“ löscht alles mit Rückfrage; kein Einzel-Wischen im Wagen.
- Eigene Einträge (z. B. „Kaffee“) ohne Tage möglich.
- Optik: bestehende CSS-Variablen/Dark Mode; keine neuen Bibliotheken; Touch-Events selbst gebaut, vertikales Scrollen darf nicht blockiert werden.
- Alle UI-Texte deutsch.

## Review Focus

- Mengenangabe leer, `null` oder nur Leerzeichen → keine Kacheln, kein Fehler.
- Zutat mit Zahl ohne Einheit („2 Paprika“) und mit Dezimalkomma/Bruch („1,5 kg Äpfel“, „½ Kopf Salat“) → Name ohne Zahl/Einheit.
- Zutat ohne Zahl („Salz“) → Name unverändert.
- Gleiche Zutat in unterschiedlicher Groß-/Kleinschreibung („reis“ / „Reis“) → eine Kachel.
- Dieselbe Zutat zweimal am selben Tag → zählt als 1 Tag.
- Leere Liste / leerer Wagen → freundlicher Leerzustand, „Wagen leeren“ ausgeblendet.
- Supabase-Fehler (Tabelle fehlt, offline) → `alert`/Hinweis wie bei Gedanken, UI bleibt bedienbar.
- Senkrechtes Scrollen der Liste löst kein Wischen aus.

---

### Task 1: Zutaten-Logik mit Test

**Files:**
- Modify: `index.html` (neuer Block vor `// ── Gruppen`, zwischen den Markern `// <einkauf-pure>` / `// </einkauf-pure>`)
- Create: `tests/einkauf.test.mjs`

**Interfaces:**
- Produces:
  - `parseZutaten(mengen: string|null|undefined): string[]` – Namen in Originalschreibweise (erster Buchstabe groß), Reihenfolge wie im Text.
  - `zaehleZutaten(rows: Array<{[k:string]:string}>): Array<{name:string, tage:number}>` – liest `row['Mengenangaben (2 Personen)']`; zählt pro Zeile jeden Namen höchstens einmal (Vergleich ohne Groß/Klein); Ergebnis alphabetisch nach Name.
  - `chargeLabel(weekIdx: number, mondayOffset: number): string` – z. B. `"Woche 2 · 8.6.–14.6."`; `weekIdx` 0-basiert (Anzeige +1), Datum aus `getMondayOffset(mondayOffset)` und `fmtD` (vorhanden).

- [ ] **Step 1: Failing test schreiben** in `tests/einkauf.test.mjs`: liest `index.html`, schneidet den Text zwischen den Markern aus, bildet per `new Function` die drei Funktionen (für `chargeLabel` werden `getMondayOffset`/`fmtD` als Stubs injiziert). Tests, mit exakten Werten:
  - `parseZutaten('400 g Pute, 600 g Kartoffeln, 2 Paprika')` → `['Pute','Kartoffeln','Paprika']`
  - `parseZutaten('1,5 kg Äpfel, ½ Kopf Salat, Salz')` → `['Äpfel','Salat','Salz']` (Einheiten: g, kg, ml, l, EL, TL, Stück, Kopf, Dose, Bund, Pkg.)
  - `parseZutaten('')`, `parseZutaten(null)`, `parseZutaten('  ')` → `[]`
  - `zaehleZutaten` mit drei Zeilen (`'150 g Reis, 400 g Pute'`, `'150 g Reis'`, `'200 g reis, 100 g reis'`) → `[{name:'Pute',tage:1},{name:'Reis',tage:3}]`
  - `chargeLabel(1, 0)` mit Stub-Montag 8.6. → `'Woche 2 · 8.6.–14.6.'`
- [ ] **Step 2: Fehlschlag prüfen:** `node --test tests/einkauf.test.mjs` → FAIL (Marker/Funktionen fehlen).
- [ ] **Step 3: Funktionen in `index.html` implementieren** (Signaturen oben). Ansatz: pro Teil `trim()`, Regex `^[\d.,/½¼¾\s]*(?:(?:g|kg|ml|l|EL|TL|Stück|Kopf|Dose|Bund|Pkg\.?)\s+)?` entfernen, Rest ist der Name; leere Namen verwerfen.
- [ ] **Step 4: Test grün:** `node --test tests/einkauf.test.mjs` → alle PASS.
- [ ] **Step 5: Commit:** `git add index.html tests/einkauf.test.mjs && git commit -m "feat: Zutaten parsen und zählen"`

### Task 2: Tabelle und Datenzugriff

**Files:**
- Create: `supabase_einkaufsliste.sql`
- Modify: `index.html` (State + Datenfunktionen, nach den Gedanken-Funktionen)

**Interfaces:**
- Consumes: `sb`, `currentGroup` (vorhanden).
- Produces:
  - Tabelle `einkaufsliste(id bigint identity pk, gruppe_id bigint not null, name text not null, tage int null, im_wagen boolean not null default false, charge text not null default '', erstellt_am timestamptz not null default now())`, Index auf `gruppe_id`, RLS an, Policy `for all using (true) with check (true)` (wie `supabase_push_subscriptions.sql`).
  - `var einkauf = []` – alle Zeilen der Gruppe, sortiert nach `id`.
  - `async function loadEinkauf(): Promise<void>` – lädt, setzt `einkauf`, ruft `updateWagenBadge()`; bei Fehler `alert('Fehler: ' + message)` nur wenn eine Einkaufs-Seite offen ist, sonst still.
  - `async function addEinkaufBatch(items: Array<{name:string,tage:number|null}>, charge: string): Promise<void>` – ein `insert` mit `gruppe_id`, danach `loadEinkauf()` und `renderEinkauf()`.
  - `async function updateEinkauf(id:number, patch:object): Promise<void>`, `async function deleteEinkauf(id:number): Promise<void>`, `async function leereWagen(): Promise<void>` (löscht `gruppe_id = currentGroup.id and im_wagen = true`). Alle laden danach neu und rendern beide Seiten.
  - `function updateWagenBadge(): void` – setzt Text von `#wagen-count` (Anzahl `im_wagen`), `hidden` bei 0.
- Produces (Stubs, damit Task 2 allein lauffähig ist): leere `function renderEinkauf(){}` und `function renderWagen(){}`, werden in Task 4/5 gefüllt.

- [ ] **Step 1:** `supabase_einkaufsliste.sql` schreiben (Spalten/Policy wie oben, Kommentar: „einmal im SQL-Editor ausführen“).
- [ ] **Step 2:** Datenfunktionen in `index.html` implementieren (Signaturen oben).
- [ ] **Step 3: Verifikation (manuell):** Nutzer führt das SQL im Supabase-SQL-Editor aus. Danach lokal `python3 -m http.server 8000` im Projektordner, Seite öffnen, in der Konsole `await addEinkaufBatch([{name:'Test',tage:1}],'Test'); einkauf` → Array mit einer Zeile; `await deleteEinkauf(einkauf[0].id)`; `einkauf` → leer.
- [ ] **Step 4: Commit:** `git commit -am "feat: Tabelle und Datenzugriff Einkaufsliste"` (inkl. neue SQL-Datei per `git add`).

### Task 3: Header-Taste, Wochen-Sheet, Erzeugen

**Files:**
- Modify: `index.html` (Header-Button, `PATHS`-Icon `cart`, Sheet-Funktion)

**Interfaces:**
- Consumes: `zaehleZutaten`, `chargeLabel`, `addEinkaufBatch` (Task 1/2), `allWeeks`, `getCurrentPlanIdx()`, `openEdit`-Muster (`#sheet-inner`, `#overlay`, `closeModal()`).
- Produces:
  - `function openEinkaufAuswahl(): void` – Sheet „Einkaufsliste erstellen“ mit vier Optionen (Radio), Voreinstellung „Diese“, Knopf „Erstellen“ (Klasse `btn-save`).
  - `async function erstelleEinkauf(anzahl: 1|2|4): Promise<void>` – für `k = 0..anzahl-1`: `idx = (getCurrentPlanIdx()+k) % 4`, Zeilen `allWeeks[idx]` (fehlend → leer), `zaehleZutaten` → `addEinkaufBatch(items, chargeLabel(idx, k))` (eine Charge pro Woche, Reihenfolge k aufsteigend); danach `closeModal()` und `openEinkauf()`. Optionen: „Diese“=1, „Nächste“ = nur k=1 (Sonderfall: Parameter `start` 0|1 ergänzen → Signatur `erstelleEinkauf(start:0|1, anzahl:1|2|4)`), „Diese + nächste“=(0,2), „Alle 4“=(0,4).
  - Neuer Header-Button (id `einkauf-btn`, Icon `cart`) direkt vor `#gedanken-btn`, `onclick="openEinkaufAuswahl()"`.
- Wenn alle gewählten Wochen keine Zutaten ergeben: Hinweis im Sheet („Keine Zutaten gefunden“), nichts wird gespeichert.

- [ ] **Step 1:** Button, Icon und `openEinkaufAuswahl`/`erstelleEinkauf` implementieren.
- [ ] **Step 2: Verifikation (manuell, Browser):** Taste öffnet Sheet; „Diese + nächste“ → Supabase-Tabelle enthält Zeilen mit zwei verschiedenen `charge`-Werten; Zutaten ohne Zahl/Gramm, Tage korrekt gegen `4_wochen_plan.csv` geprüft (z. B. Woche 1: Reis 3, Pute 2, Kartoffeln 3).
- [ ] **Step 3: Commit:** `git commit -am "feat: Einkaufsliste erzeugen"`

### Task 4: Listenfenster mit Wischen, Bearbeiten, Eigener Eintrag

**Files:**
- Modify: `index.html` (HTML `#einkauf-page`, CSS, JS, `closePage`, Escape-Handler)

**Interfaces:**
- Consumes: `einkauf`, `updateEinkauf`, `deleteEinkauf`, `addEinkaufBatch`, `.page`/`.page-head`/`.page-body`/`.page-foot`/`.form-input` (vorhanden).
- Produces:
  - `function closePage(id?: string): void` – ändert die bestehende Funktion: entfernt `show` von `id || 'gedanken-page'`. Der Zurück-Pfeil des Gedanken-Fensters bleibt unverändert funktional. Escape-Handler in `keydown` schließt zusätzlich offene `einkauf-page`/`wagen-page`.
  - `async function openEinkauf(): Promise<void>` – `loadEinkauf()`, Seite `#einkauf-page` zeigen, `renderEinkauf()`. Titel „Einkaufsliste“, Fuß mit Eingabefeld (Platzhalter „z. B. Kaffee“) + Plus-Knopf (wie Gedanken) → `addEinkaufBatch([{name, tage:null}], 'Eigene Einträge')`.
  - `function renderEinkauf(): void` – gruppiert `einkauf.filter(!im_wagen)` nach `charge` in Reihenfolge des ersten Auftretens; je Gruppe Überschrift (Klasse `ek-charge`, `margin-top: 28px` ab der zweiten Gruppe), darunter Kacheln (Klasse `ek-tile`) mit Name und `tage` („1 Tag“/„N Tage“, bei `null` nichts). Leerzustand „Die Einkaufsliste ist leer.“
  - `function attachSwipe(tile: HTMLElement, onLeft: () => void, onRight: () => void): void` – Touch-Events; Kachel besteht aus Hintergrundlayer (`.ek-bg`) + Inhalt (`.ek-fg`), `.ek-fg` folgt dem Finger per `transform: translateX`; Richtungssperre: erst wenn `|dx| > 8` und `|dx| > |dy|` wird horizontal übernommen und `preventDefault()` aufgerufen (Listener `{passive:false}` auf `touchmove`), sonst bleibt vertikales Scrollen frei. Hintergrund wird bei `dx<0` rot (`var(--danger)`), bei `dx>0` grün (neue Variable `--ok`, in Light- und Dark-Block definieren) mit Deckkraft proportional zu `|dx|`. Auslösen bei `|dx| > 90px` (Kachel gleitet aus, `onLeft`/`onRight`), sonst federt sie per `transition` zurück. Mausbedienung für Desktop-Tests: gleiche Logik über Pointer Events ist **nicht** gefordert.
  - Antippen (kein Wischen) → `openEinkaufEdit(id)`: Sheet mit Feldern Name und Tage (Zahl, leer erlaubt), Knöpfe Speichern (`updateEinkauf`) und Abbrechen.
  - Links wischen → `deleteEinkauf(id)`; rechts → `updateEinkauf(id,{im_wagen:true})`.

- [ ] **Step 1:** Seite, CSS (inkl. `--ok`), `closePage(id)`, `renderEinkauf`, `attachSwipe`, `openEinkaufEdit`, Eingabefuß implementieren.
- [ ] **Step 2: Verifikation (Browser-Pane mit mobilem Viewport 375×812, Touch-Emulation per `javascript_tool`-Events oder DevTools):** Wischen links → rote Animation, Kachel verschwindet, Zeile in Supabase gelöscht; rechts → grün, `im_wagen=true`; kurzes Wischen springt zurück; vertikales Scrollen bei langer Liste scrollt, löst nichts aus; zweite Erzeugung erscheint mit sichtbarem Abstand und Überschrift; Antippen → Bearbeiten speichert; „Kaffee“ hinzufügen erscheint unter „Eigene Einträge“.
- [ ] **Step 3: Commit:** `git commit -am "feat: Einkaufsliste mit Wischgesten"`

### Task 5: Einkaufswagen und Menü-Eintrag

**Files:**
- Modify: `index.html` (Menü-Eintrag, `#wagen-page`, init)

**Interfaces:**
- Consumes: `einkauf`, `leereWagen`, `loadEinkauf`, `updateWagenBadge`, `closePage(id)` (Task 4).
- Produces:
  - Menü-Eintrag in `#menu` vor dem Trenner „Darstellung“: Button „Einkaufswagen“ mit `<span id="wagen-count" class="icon-badge" hidden>`-ähnlicher Zahl (inline, nicht absolut positioniert, Klasse `menu-count`), `onclick="closeMenu();openWagen()"`.
  - `async function openWagen(): Promise<void>` – `loadEinkauf()`, `#wagen-page` zeigen, `renderWagen()`.
  - `function renderWagen(): void` – Kacheln `einkauf.filter(im_wagen)` (nur Anzeige, gleiche Kachel-Optik ohne Wischen); Leerzustand „Der Einkaufswagen ist leer.“ und Knopf „Wagen leeren“ (`btn-del`-Stil) nur bei ≥ 1 Kachel → `if (confirm('Einkaufswagen leeren?')) leereWagen()`.
  - `init()` ruft nach `refreshGedankenBadge()` ein `loadEinkauf()`; `visibilitychange` und das 45-s-Intervall laden es ebenfalls.

- [ ] **Step 1:** Menü-Eintrag, Seite, `openWagen`, `renderWagen`, init-Aufrufe implementieren.
- [ ] **Step 2: Verifikation (Browser):** Kachel nach rechts wischen → Zahl im Menü-Eintrag steigt; Wagen-Fenster zeigt sie; „Wagen leeren“ fragt nach, leert alles, Zahl verschwindet; Wagen-Kacheln lassen sich nicht wischen; Seite neu laden → Stand bleibt (Supabase).
- [ ] **Step 3: Gesamtlauf:** `node --test tests/einkauf.test.mjs` PASS; Konsole ohne Fehler beim Durchklicken von Erzeugen → Liste → Wagen → Leeren; Dark Mode (Menü „Dunkel“) prüfen: rot/grün lesbar.
- [ ] **Step 4: Commit:** `git commit -am "feat: Einkaufswagen im Menü"`

---

## Self-Review

- **Spec-Abdeckung:** Taste/Sheet/Wochenwahl (T3), Parsing + Zählen (T1), Liste/Wischen/Bearbeiten/Eigene/Chargen-Abstand (T4), Wagen/Badge/Leeren (T5), Tabelle (T2), Kein Einzel-Wischen im Wagen (T5). Offline-Cache wurde als nachrangig bewusst nicht eingeplant (Spec: „wünschenswert, nachrangig“).
- **Typkonsistenz:** `erstelleEinkauf(start, anzahl)`; `closePage(id?)`; `addEinkaufBatch(items, charge)` einheitlich in T2–T4.
- **Annahme:** `allWeeks` hat bis zu 4 Einträge, Index = Wochennummer−1 (so nutzt es `openEdit` mit `planIdx+1`).

# Essensplan PWA – Einrichtungsanleitung

## Dateien in diesem Ordner
- `index.html` – die komplette App
- `manifest.json` – macht daraus eine installierbare PWA
- `sw.js` – Service Worker für Offline-Funktion

## Schritt-für-Schritt: GitHub Pages

### 1. GitHub Account erstellen
→ https://github.com/signup (kostenlos)

### 2. Neues Repository anlegen
- Oben rechts auf „+" → „New repository"
- Name: `essensplan`
- Sichtbarkeit: Public
- „Create repository" klicken

### 3. Dateien hochladen
- Im neuen Repository auf „uploading an existing file" klicken
- Alle 3 Dateien (index.html, manifest.json, sw.js) reinziehen
- Unten auf „Commit changes" klicken

### 4. GitHub Pages aktivieren
- Im Repository auf „Settings" (oben)
- Links auf „Pages"
- Unter „Branch" → main auswählen → Save
- Nach ~1 Minute ist die App erreichbar unter:
  https://DEINNAME.github.io/essensplan

### 5. Auf iPhone installieren (Safari)
1. URL im Safari öffnen
2. Teilen-Button (Kasten mit Pfeil nach oben)
3. „Zum Home-Bildschirm" tippen
4. „Hinzufügen" – fertig!

### 6. Auf Android installieren (Chrome)
1. URL in Chrome öffnen
2. Drei Punkte oben rechts
3. „App installieren" oder „Zum Startbildschirm"
4. Bestätigen – fertig!

## Beide Nutzer
Einfach dieselbe URL teilen. Anna und Ben können zwischen
den Profilen wechseln. Die Daten sind aktuell Simulationsdaten –
später kann eine echte Datenbank (Supabase) angebunden werden.

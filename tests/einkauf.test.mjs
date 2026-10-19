import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const m = html.match(/\/\/ <einkauf-pure>([\s\S]*?)\/\/ <\/einkauf-pure>/);
assert.ok(m, 'Marker // <einkauf-pure> fehlt in index.html');

// getMondayOffset/fmtD sind Seiten-Funktionen; hier als Stubs (Montag 8.6.2026)
const { parseZutaten, zaehleZutaten, chargeLabel } = new Function(
  'getMondayOffset', 'fmtD',
  m[1] + '; return { parseZutaten, zaehleZutaten, chargeLabel };'
)(
  (off) => new Date(2026, 5, 8 + off * 7),
  (d) => d.getDate() + '.' + (d.getMonth() + 1) + '.'
);

const K = 'Mengenangaben (2 Personen)';

test('parseZutaten entfernt Zahl und Einheit', () => {
  assert.deepEqual(parseZutaten('400 g Pute, 600 g Kartoffeln, 2 Paprika'), ['Pute', 'Kartoffeln', 'Paprika']);
});
test('parseZutaten: Dezimal, Bruch, Einheiten ohne g, Name ohne Zahl', () => {
  assert.deepEqual(parseZutaten('1,5 kg Äpfel, ½ Kopf Salat, Salz'), ['Äpfel', 'Salat', 'Salz']);
});
test('parseZutaten: leer/null/Leerzeichen → []', () => {
  assert.deepEqual(parseZutaten(''), []);
  assert.deepEqual(parseZutaten(null), []);
  assert.deepEqual(parseZutaten('  '), []);
});
test('zaehleZutaten zählt Tage, case-insensitiv, einmal pro Zeile', () => {
  const rows = [{ [K]: '150 g Reis, 400 g Pute' }, { [K]: '150 g Reis' }, { [K]: '200 g reis, 100 g reis' }];
  assert.deepEqual(zaehleZutaten(rows), [{ name: 'Pute', tage: 1 }, { name: 'Reis', tage: 3 }]);
});
test('chargeLabel', () => {
  assert.equal(chargeLabel(1, 0), 'Woche 2 · 8.6.–14.6.');
});

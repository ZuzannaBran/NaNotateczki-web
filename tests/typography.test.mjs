import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const stylesheet = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

test('all website text uses the bundled Georgia-like serif', () => {
  assert.match(stylesheet, /body\{[^\n]+font-family:"Gelasio",Georgia,/);
  assert.match(stylesheet, /\.brand-mark\{[^\n]+font-family:inherit;/);
  assert.match(stylesheet, /button,input,select,textarea\{font:inherit\}/);
});

test('both variable font files are declared and present', () => {
  for (const name of ['Gelasio-Variable.ttf', 'Gelasio-Italic-Variable.ttf']) {
    assert.ok(
      stylesheet.includes('url("./assets/fonts/' + name + '")'),
      'font missing from CSS: ' + name,
    );
    const asset = new URL('../assets/fonts/' + name, import.meta.url);
    assert.ok(statSync(asset).size > 100000, 'font file is missing or empty');
  }
  assert.match(stylesheet, /font-weight: 400 700;/);
  assert.match(stylesheet, /font-style: italic;/);
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('Frontend Sanity: DOM Helpers & Syntax Integrity', async (t) => {
  const publicJsDir = path.join(__dirname, '..', 'public', 'js');
  const files = fs.readdirSync(publicJsDir).filter(f => f.endsWith('.js') && !f.includes('.bak'));

  await t.test('Verifikasi sintaks seluruh file public/js/', () => {
    for (const file of files) {
      const filePath = path.join(publicJsDir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      assert.doesNotThrow(() => {
        new vm.Script(code, { filename: file });
      }, `File ${file} memiliki kesalahan sintaks JavaScript!`);
    }
  });

  await t.test('Verifikasi tidak ada pemanggilan metode array pada selector tunggal $(...) di public/js/', () => {
    const invalidPattern = /(?:^|[^$])\$\([^\)]+\)\s*\.(forEach|map|filter|find|some|every|reduce)/g;
    const violations = [];

    for (const file of files) {
      const filePath = path.join(publicJsDir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        if (invalidPattern.test(line)) {
          violations.push(`${file}:${idx + 1}: ${line.trim()}`);
        }
      });
    }

    assert.equal(
      violations.length,
      0,
      `Ditemukan selector tunggal $(...) yang memanggil metode array (gunakan $$): \n${violations.join('\n')}`
    );
  });
});

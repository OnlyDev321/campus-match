import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/textScramble.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { scrambleText, textGraphemes } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('student IDs, punctuation, spaces and line breaks remain unchanged', () => {
  const text = '****0021 / 20260020\n09:00 – 10:15 (3/5)';
  assert.equal(scrambleText(text), text);
});

test('names and other values interpolated into translations remain readable', () => {
  const text = 'Đơn đã gửi tới Nguyễn Văn An, nhóm CampusMatch.';
  for (let i = 0; i < 20; i++) {
    const result = scrambleText(text, ['Nguyễn Văn An', 'CampusMatch']);
    assert.ok(result.includes('Nguyễn Văn An'));
    assert.ok(result.includes('CampusMatch'));
    assert.notEqual(result, text);
  }
});

test('every occurrence of a protected value is preserved', () => {
  const result = scrambleText('Hà đã mời Hà tham gia nhóm.', ['Hà']);
  assert.equal(result.split('Hà').length - 1, 2);
});

test('Vietnamese combining marks and emoji are kept as whole graphemes', () => {
  assert.deepEqual(textGraphemes('e\u0302👨‍👩‍👧‍👦한'), ['e\u0302', '👨‍👩‍👧‍👦', '한']);
  assert.ok(scrambleText('Xin chào 👨‍👩‍👧‍👦').endsWith('👨‍👩‍👧‍👦'));
});

test('Korean text keeps full-width Korean characters and original spacing', () => {
  const result = scrambleText('스터디 탐색 2026');
  assert.match(result, /^[가-힣]{3} [가-힣]{2} 2026$/u);
});

test('protected multilingual content remains intact', () => {
  assert.equal(scrambleText('Nhóm 한글 e\u0302', ['Nhóm', '한글', 'e\u0302']), 'Nhóm 한글 e\u0302');
});

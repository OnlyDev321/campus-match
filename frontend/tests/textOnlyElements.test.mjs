import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    return entry.isDirectory() ? sourceFiles(url) : entry.name.endsWith('.tsx') ? [url] : [];
  }));
  return paths.flat();
}

test('native text-only elements do not contain ScrambleText or other JSX elements', async () => {
  const violations = [];
  for (const file of await sourceFiles(new URL('../src/', import.meta.url))) {
    const source = ts.createSourceFile(file.pathname, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function inspect(node, textOnlyParent) {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        if (textOnlyParent) {
          const position = source.getLineAndCharacterOfPosition(node.getStart(source));
          violations.push(`${file.pathname}:${position.line + 1}: JSX nested inside <${textOnlyParent}>`);
        }
        if (ts.isJsxElement(node)) {
          const tag = node.openingElement.tagName.getText(source);
          const restricted = ['option', 'textarea', 'title'].includes(tag) ? tag : undefined;
          node.children.forEach((child) => inspect(child, restricted));
        }
        return;
      }
      ts.forEachChild(node, (child) => inspect(child, textOnlyParent));
    }
    inspect(source, undefined);
  }
  assert.deepEqual(violations, [], violations.join('\n'));
});

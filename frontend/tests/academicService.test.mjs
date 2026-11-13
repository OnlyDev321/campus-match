import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/services/academicService.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function service(fetchImpl) {
  const compiled = { exports: {} };
  const imports = {
    '@/lib/api': { API_BASE_URL: 'http://backend.test/api' },
    '@/stores/languageStore': { useLanguageStore: { getState: () => ({ language: 'vi' }) } },
  };
  new Function('require', 'module', 'exports', 'fetch', outputText)(
    (name) => { assert.ok(Object.hasOwn(imports, name)); return imports[name]; },
    compiled, compiled.exports, fetchImpl,
  );
  return compiled.exports.getAcademicCatalog;
}

test('loads official catalog with selected language and abort support', async () => {
  const data = { syncedAt: '2026-11-13T00:00:00Z', source: 'https://ssu.ac.kr/', colleges: [
    { name: 'IT대학', sourceUrl: 'https://ssu.ac.kr/', departments: ['컴퓨터학부'] },
  ] };
  const controller = new AbortController();
  const getCatalog = service(async (url, init) => {
    assert.equal(url, 'http://backend.test/api/academic-units');
    assert.equal(init.signal, controller.signal);
    assert.equal(init.headers['Accept-Language'], 'vi');
    return { ok: true, json: async () => data };
  });
  assert.deepEqual(await getCatalog(controller.signal), data);
});

test('does not substitute mock departments when the source is unavailable', async () => {
  await assert.rejects(service(async () => ({ ok: false }))(), /CATALOG_UNAVAILABLE/);
});

test('rejects empty or malformed directories', async () => {
  for (const data of [null, {}, { colleges: [] }, { colleges: [null] },
    { colleges: [{ name: 'IT대학', departments: [123] }] }]) {
    await assert.rejects(service(async () => ({ ok: true, json: async () => data }))(), /INVALID_CATALOG/);
  }
});

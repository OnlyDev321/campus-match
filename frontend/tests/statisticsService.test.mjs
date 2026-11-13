import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/services/statisticsService.ts', import.meta.url), 'utf8');
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
  return compiled.exports.getPublicStatistics;
}

test('fetches exact aggregate counts without authentication, cache, or mock fallback', async () => {
  const data = { verifiedStudents: 1, recruitingGroups: 0, fullGroups: 0 };
  const controller = new AbortController();
  const getStatistics = service(async (url, init) => {
    assert.equal(url, 'http://backend.test/api/statistics');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.signal, controller.signal);
    assert.deepEqual(init.headers, { 'Accept-Language': 'vi' });
    return { ok: true, json: async () => data };
  });
  assert.deepEqual(await getStatistics(controller.signal), data);
});

test('backend errors are not replaced by fake counts', async () => {
  const getStatistics = service(async () => ({ ok: false }));
  await assert.rejects(getStatistics(), /STATISTICS_UNAVAILABLE/);
});

test('rejects malformed, negative, fractional, and missing counts', async () => {
  for (const data of [null, {}, { verifiedStudents: -1, recruitingGroups: 0, fullGroups: 0 },
    { verifiedStudents: 1, recruitingGroups: '12', fullGroups: 0 },
    { verifiedStudents: 1, recruitingGroups: 2, fullGroups: 0.5 }]) {
    const getStatistics = service(async () => ({ ok: true, json: async () => data }));
    await assert.rejects(getStatistics(), /INVALID_STATISTICS/);
  }
});

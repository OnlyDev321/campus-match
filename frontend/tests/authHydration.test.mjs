import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/hooks.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function authGuard() {
  let hydrated = false;
  let loggedIn = false;
  let loading = false;
  let effects = [];
  const prompts = [];
  const redirects = [];
  const router = { push: (path) => redirects.push(path) };
  const openLoginModal = (path) => prompts.push(path);
  const imports = {
    react: { useEffect: (effect) => effects.push(effect) },
    'next/navigation': { useRouter: () => router },
    '@/lib/api': {},
    '@/stores/authStore': {
      useAuthHydrated: () => hydrated,
      useAuthStore: () => ({ isLoggedIn: loggedIn, isLoading: loading, openLoginModal }),
    },
  };
  const compiledModule = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(
    (name) => {
      assert.ok(Object.hasOwn(imports, name), `Unexpected dependency: ${name}`);
      return imports[name];
    }, compiledModule, compiledModule.exports,
  );
  return {
    prompts, redirects,
    render(state) {
      ({ hydrated, loggedIn, loading = false } = state);
      effects = [];
      const ready = compiledModule.exports.useRequireLogin('/groups');
      effects.forEach((effect) => effect());
      return ready;
    },
  };
}

test('reload waits for stored session without prompting or redirecting', () => {
  const guard = authGuard();
  assert.equal(guard.render({ hydrated: false, loggedIn: false }), false);
  assert.deepEqual(guard.prompts, []);
  assert.deepEqual(guard.redirects, []);
  assert.equal(guard.render({ hydrated: true, loggedIn: true }), true);
  assert.deepEqual(guard.prompts, []);
  assert.deepEqual(guard.redirects, []);
});

test('server hydration snapshot stays pending even if local session is already restored', () => {
  const guard = authGuard();
  assert.equal(guard.render({ hydrated: false, loggedIn: true }), false);
  assert.equal(guard.render({ hydrated: true, loggedIn: true }), true);
  assert.deepEqual(guard.prompts, []);
  assert.deepEqual(guard.redirects, []);
});

test('confirmed guest is prompted only after hydration finishes', () => {
  const guard = authGuard();
  guard.render({ hydrated: false, loggedIn: false });
  assert.deepEqual(guard.prompts, []);
  guard.render({ hydrated: true, loggedIn: false });
  assert.deepEqual(guard.prompts, ['/groups']);
  assert.deepEqual(guard.redirects, ['/']);
});

test('pending login is not interrupted by another prompt', () => {
  const guard = authGuard();
  assert.equal(guard.render({ hydrated: true, loggedIn: false, loading: true }), false);
  assert.deepEqual(guard.prompts, []);
  assert.deepEqual(guard.redirects, []);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

// Chạy mã service/API thực với HTTP giả lập, không cần tài khoản hoặc backend.
function loadServices(fetch) {
  const cache = new Map();
  const root = fileURLToPath(new URL('../src', import.meta.url));
  function load(name) {
    if (name === '@/stores/authStore') return { useAuthStore: { getState: () => ({ token: 'signed-jwt' }) } };
    if (name === '@/stores/languageStore') return { useLanguageStore: { getState: () => ({ language: 'vi' }) } };
    if (cache.has(name)) return cache.get(name).exports;
    const file = path.join(root, name.replace(/^@\//, '') + '.ts');
    const compiledModule = { exports: {} };
    cache.set(name, compiledModule);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      module: compiledModule, exports: compiledModule.exports, require: load, fetch, Headers,
      process: { env: { NEXT_PUBLIC_USE_MOCK_API: 'false', NEXT_PUBLIC_API_BASE_URL: 'http://backend.test/api' } },
    }, { filename: file });
    return compiledModule.exports;
  }
  return { groups: load('@/services/groupService'), applications: load('@/services/applicationService') };
}

test('Manage gửi đúng endpoint, method, body, JWT và ngôn ngữ khi dùng API thật', async () => {
  const requests = [];
  const summary = { id: 101 };
  const application = { id: 9001, status: 'ACCEPTED' };
  const { groups, applications } = loadServices(async (url, init) => {
    requests.push({ url, init });
    if (url.endsWith('/users/me/groups')) return Response.json([summary]);
    if (init.method === 'DELETE' || init.method === 'PUT' && url.endsWith('/groups/101')) return new Response(null, { status: 204 });
    return Response.json(url.endsWith('/applications') ? [application] : application);
  });
  assert.equal((await groups.getMyGroups())[0].id, 101);
  await groups.updateManagedGroup(101, { title: '  Project  ', description: ' Goal ', maxMembers: 4 });
  await groups.closeGroupRecruitment(101);
  assert.equal((await applications.getGroupApplications(101))[0].id, 9001);
  assert.equal((await applications.acceptApplication(9001)).status, 'ACCEPTED');
  await applications.rejectApplication(9001);
  assert.deepEqual(requests.map(({ url, init }) => [url.replace('http://backend.test/api', ''), init.method || 'GET']), [
    ['/users/me/groups', 'GET'], ['/groups/101', 'PUT'], ['/groups/101', 'DELETE'],
    ['/groups/101/applications', 'GET'], ['/applications/9001/accept', 'PUT'], ['/applications/9001/reject', 'PUT'],
  ]);
  assert.deepEqual(JSON.parse(requests[1].init.body), { title: 'Project', description: 'Goal', maxMembers: 4 });
  for (const { init } of requests) {
    assert.equal(init.headers.get('Authorization'), 'Bearer signed-jwt');
    assert.equal(init.headers.get('Accept-Language'), 'vi');
  }
  assert.equal(requests[1].init.headers.get('Content-Type'), 'application/json');
});

for (const [status, code] of [[400, 'BAD_REQUEST'], [401, 'UNAUTHORIZED'], [403, 'FORBIDDEN'], [404, 'NOT_FOUND'], [409, 'CONFLICT'], [422, 'BAD_REQUEST'], [500, 'SERVER_ERROR']]) {
  test(`HTTP ${status} ánh xạ sang ${code}, không fallback mock`, async () => {
    const { groups } = loadServices(async () => Response.json({ message: 'Server message' }, { status }));
    await assert.rejects(groups.getMyGroups(), (error) => error.errorCode === code);
  });
}

test('Mất kết nối hiển thị NETWORK_ERROR', async () => {
  const { groups } = loadServices(async () => { throw new Error('offline'); });
  await assert.rejects(groups.getMyGroups(), (error) => error.errorCode === 'NETWORK_ERROR');
});

test('Dữ liệu chỉnh nhóm không hợp lệ không gửi lên server', async () => {
  const { groups } = loadServices(async () => { assert.fail('Unexpected HTTP request'); });
  for (const payload of [
    { title: '', description: 'Goal', maxMembers: 4 },
    { title: 'Project', description: '', maxMembers: 4 },
    { title: 'Project', description: 'Goal', maxMembers: 1.5 },
    { title: 'Project', description: 'Goal', maxMembers: 0 },
  ]) await assert.rejects(groups.updateManagedGroup(101, payload), (error) => error.errorCode === 'BAD_REQUEST');
});

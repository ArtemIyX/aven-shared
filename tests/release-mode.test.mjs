import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { resolveReleaseMode } from '../scripts/release-mode.mjs'

const mainRef = 'refs/heads/main'

test('pushes to main publish the merged package version', () => {
  assert.equal(resolveReleaseMode('push', mainRef), 'publish')
})

test('manual runs on main publish the merged package version', () => {
  assert.equal(resolveReleaseMode('workflow_dispatch', mainRef), 'publish')
})

test('rejects manual releases from refs other than main', () => {
  assert.throws(
    () => resolveReleaseMode('workflow_dispatch', 'refs/heads/CI-3'),
    /only from main/,
  )
})

test('rejects unsupported events', () => {
  assert.throws(
    () => resolveReleaseMode('pull_request', mainRef),
    /Unsupported release event/,
  )
})

test('npm version updates the package and lockfile for each semver bump', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'aven-release-version-'))
  context.after(() => rm(directory, { recursive: true, force: true }))

  await writeFile(join(directory, 'package.json'), JSON.stringify({
    name: 'aven-release-version-test',
    version: '0.1.0',
  }, null, 2))
  await writeFile(join(directory, 'package-lock.json'), JSON.stringify({
    name: 'aven-release-version-test',
    version: '0.1.0',
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': { name: 'aven-release-version-test', version: '0.1.0' },
    },
  }, null, 2))

  const npmCli = process.env.npm_execpath
  assert.ok(npmCli, 'run this test through npm so npm_execpath is available')

  for (const [bump, expectedVersion] of [
    ['patch', '0.1.1'],
    ['minor', '0.2.0'],
    ['major', '1.0.0'],
  ]) {
    execFileSync(process.execPath, [npmCli, 'version', bump, '--no-git-tag-version'], {
      cwd: directory,
      stdio: 'pipe',
    })

    const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))
    const packageLock = JSON.parse(await readFile(join(directory, 'package-lock.json'), 'utf8'))
    assert.equal(packageJson.version, expectedVersion)
    assert.equal(packageLock.version, expectedVersion)
    assert.equal(packageLock.packages[''].version, expectedVersion)
  }
})

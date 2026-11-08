import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const dir = await mkdtemp(path.join(tmpdir(), 'aven-packed-check-'))
const npm =
  process.env.npm_execpath ||
  path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options })
  if (result.status !== 0)
    throw Error(`${command} ${args.join(' ')} failed:\n${result.stderr}\n${result.stdout}`)
  return result.stdout
}
try {
  const packed = JSON.parse(
    run(process.execPath, [
      npm,
      'pack',
      '--json',
      '--workspace',
      '@wellsaik/aven-shared',
      '--pack-destination',
      dir,
    ]),
  )
  const archive = path.join(dir, packed[0].filename)
  await writeFile(
    path.join(dir, 'package.json'),
    '{"name":"aven-packed-smoke","version":"1.0.0","private":true}\n',
  )
  run(
    process.execPath,
    [npm, 'install', '--offline', '--ignore-scripts', '--legacy-peer-deps', archive],
    { cwd: dir },
  )
  const req = createRequire(path.join(dir, 'package.json')),
    seen = new Set()
  async function walk(file) {
    if (seen.has(file)) return
    seen.add(file)
    const css = await readFile(file, 'utf8')
    for (const match of css.matchAll(/@import\s+["']([^"']+)["']/g))
      await walk(path.resolve(path.dirname(file), match[1]))
  }
  for (const name of ['tokens', 'base', 'colors', 'finance', 'charts', 'diagrams', 'gradients'])
    await walk(req.resolve(`@wellsaik/aven-shared/${name}.css`))
  assert(seen.size >= 15, `only ${seen.size} stylesheets resolved`)
  const cssDir = path.dirname(req.resolve('@wellsaik/aven-shared/colors.css'))
  console.log(`Packed exports resolved with ${seen.size} transitive stylesheets.`)
  const result = spawnSync(process.execPath, ['scripts/browser-colors.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, AVEN_CSS_DIR: cssDir },
  })
  process.stdout.write(result.stdout)
  process.stderr.write(result.stderr)
  assert.equal(result.status, 0, 'Packed stylesheet browser checks failed')
} finally {
  if (path.basename(dir).startsWith('aven-packed-check-') && path.dirname(dir) === tmpdir())
    await rm(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}

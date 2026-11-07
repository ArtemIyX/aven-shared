import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../packages/vue/dist')
const files = await readdir(dist)
for (const file of files) {
  if (file.endsWith('.vue.d.ts')) {
    const destination = path.join(dist, file.replace('.vue.d.ts', '.d.ts'))
    await rm(destination, { force: true })
    await rename(path.join(dist, file), destination)
  }
}

for (const file of await readdir(dist)) {
  if (!file.endsWith('.d.ts')) continue
  const absolute = path.join(dist, file)
  const original = await readFile(absolute, 'utf8')
  const rewritten = original.replace(
    /((?:from\s*|import\s*)['"]\.\/[^'"\n]+?)\.vue(['"])/g,
    '$1.js$2',
  )
  await writeFile(absolute, rewritten)
}

const indexPath = path.join(dist, 'index.d.ts')
await writeFile(
  path.join(dist, 'style-shim.d.ts'),
  "declare module '*.css' {\n  const stylesheet: string\n  export default stylesheet\n}\n",
)
const index = await readFile(indexPath, 'utf8')
if (!index.startsWith('/// <reference path="./style-shim.d.ts" />')) {
  await writeFile(indexPath, `/// <reference path="./style-shim.d.ts" />\n${index}`)
}

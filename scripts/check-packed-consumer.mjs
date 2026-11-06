import { mkdtemp, writeFile, readFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import assert from 'node:assert/strict'
const directory = await mkdtemp(path.join(tmpdir(), 'aven-consumer-'))
const npm = process.env.npm_execpath
assert.ok(npm, 'Run through npm')
function run(args, cwd = process.cwd()) {
  const result = spawnSync(process.execPath, [npm, ...args], { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${args.join(' ')}: ${result.stderr}\n${result.stdout}`)
  return result.stdout
}
try {
  const archives = JSON.parse(run(['pack', '--json', '--workspaces', '--pack-destination', directory]))
  assert.equal(archives.length, 2)
  const archive = name => path.join(directory, archives.find(item => item.name === name).filename)
  for (const item of archives) {
    const paths = item.files.map(file => file.path)
    assert(paths.includes('LICENSE'))
    assert(paths.includes('README.md'))
    assert(paths.includes('dist/index.js'))
    assert(paths.includes('dist/index.d.ts'))
  }
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({name:'aven-consumer-check',version:'1.0.0',private:true,type:'module'}))
  run(['install','--offline','--ignore-scripts',archive('@wellsaik/aven-shared')],directory)
  const require = createRequire(path.join(directory,'package.json'))
  assert.throws(() => require.resolve('vue'))
  const sharedImport = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('@wellsaik/aven-shared')"], {cwd: directory, encoding: 'utf8'})
  assert.equal(sharedImport.status, 0, sharedImport.stderr)
  const seen = new Set()
  async function walk(file) {
    if (seen.has(file)) return
    seen.add(file)
    for (const match of (await readFile(file,'utf8')).matchAll(/@import\s+["']([^"']+)["']/g)) await walk(path.resolve(path.dirname(file),match[1]))
  }
  for (const name of ['tokens','base','colors','finance','charts','diagrams','gradients']) await walk(require.resolve(`@wellsaik/aven-shared/${name}.css`))
  assert(seen.size >= 15)
  run(['install','--ignore-scripts',archive('@wellsaik/aven-shared'),archive('@wellsaik/aven-vue'),'vue@^3.5.0','vite@^6.0.0','typescript@^5.7.0'],directory)
  await access(require.resolve('@wellsaik/aven-vue/style.css'))
  await writeFile(path.join(directory,'index.html'),'<div id="app"></div><script type="module" src="/main.ts"></script>')
  await writeFile(path.join(directory,'main.ts'),`import { createApp, h } from 'vue'\nimport { AvenText } from '@wellsaik/aven-vue'\nimport { AvenText as Direct } from '@wellsaik/aven-vue/AvenText'\nimport '@wellsaik/aven-shared/tokens.css'\nimport '@wellsaik/aven-shared/base.css'\nimport '@wellsaik/aven-vue/style.css'\ncreateApp({render:()=>h(AvenText,{},()=>h(Direct,{},()=> 'Hello'))}).mount('#app')\n`)
  await writeFile(path.join(directory,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'ESNext',moduleResolution:'Bundler',strict:true,skipLibCheck:false,noEmit:true},include:['main.ts']}))
  run(['exec','--','tsc','-p','tsconfig.json'],directory)
  await writeFile(path.join(directory,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'NodeNext',moduleResolution:'NodeNext',strict:true,skipLibCheck:false,noEmit:true},include:['main.ts']}))
  run(['exec','--','tsc','-p','tsconfig.json'],directory)
  run(['exec','--','vite','build'],directory)
  const bundle = await readFile(path.join(directory,'node_modules/@wellsaik/aven-vue/dist/AvenText.js'),'utf8')
  assert.match(bundle,/from\s*["']vue["']/)
  assert(!bundle.includes('packages/shared/src'))
  console.log(`Packed packages installed outside the workspace; ${seen.size} shared stylesheets resolved, Vue-free shared import, TypeScript and Vite consumer passed.`)
} finally {
  await rm(directory,{recursive:true,force:true,maxRetries:5,retryDelay:200})
}



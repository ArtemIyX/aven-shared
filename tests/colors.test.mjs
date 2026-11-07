import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const m = JSON.parse(
    readFileSync(new URL('../packages/shared/src/tokens/colors.json', import.meta.url)),
  ),
  by = new Map(m.tokens.map((t) => [t.name, t]))
function resolve(name, mode, seen = new Set()) {
  assert(!seen.has(name), `cycle ${name}`)
  seen.add(name)
  const t = by.get(name)
  assert(t, `missing ${name}`)
  const v = t[mode] ?? t.value
  return typeof v === 'object' ? resolve(v.ref, mode, seen) : v
}
function luminanceRgb(rgb) {
  const c = rgb.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function luminance(hex) {
  return luminanceRgb(
    hex
      .slice(1, 7)
      .match(/../g)
      .map((x) => parseInt(x, 16) / 255),
  )
}
function ratio(a, b) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
test('known WCAG contrast cases', () => {
  assert.equal(ratio('#000000', '#FFFFFF'), 21)
  assert.equal(ratio('#FFFFFF', '#FFFFFF'), 1)
})
test('documented core and selected numeric pairings', () => {
  for (const mode of ['light', 'dark'])
    for (const [fg, bg] of [
      ['text-primary', 'surface-base'],
      ['text-secondary', 'surface-window'],
      ['gain-text', 'surface-selected'],
      ['loss-text', 'surface-selected'],
      ['selection-text', 'selection-fill'],
      ['match-text', 'match-fill'],
    ])
      assert(
        ratio(resolve('--aven-color-' + fg, mode), resolve('--aven-color-' + bg, mode)) >= 4.5,
        `${mode}: ${fg} on ${bg}`,
      )
})
test('series strokes and labels retain contrast', () => {
  for (const mode of ['light', 'dark'])
    for (let i = 1; i <= 16; i++) {
      const n = String(i).padStart(2, '0'),
        r = (x) => resolve(`--aven-color-series-${n}-${x}`, mode)
      assert(
        ratio(r('stroke'), resolve('--aven-color-surface-chart', mode)) >= 3,
        `${mode} ${n} stroke`,
      )
      assert(ratio(r('text'), r('fill')) >= 4.5, `${mode} ${n} text`)
    }
})
test('permitted gradient foregrounds contrast throughout opaque segments', () => {
  for (const g of m.gradients.filter((x) => x.foreground !== 'none'))
    for (const mode of ['light', 'dark']) {
      const fg = resolve('--aven-color-' + g.foreground, mode),
        stops = Array.from({ length: g.count }, (_, i) =>
          resolve(`--aven-gradient-${g.name}-stop-${String(i + 1).padStart(2, '0')}`, mode),
        )
      for (let i = 0; i < stops.length - 1; i++)
        for (let j = 0; j <= 100; j++) {
          const a = stops[i]
              .slice(1)
              .match(/../g)
              .map((x) => parseInt(x, 16)),
            b = stops[i + 1]
              .slice(1)
              .match(/../g)
              .map((x) => parseInt(x, 16))
          assert.equal(a.length, 3, `${g.name}: alpha requires a canvas`)
          const rgb = a.map((x, k) => (x + ((b[k] - x) * j) / 100) / 255),
            l = luminanceRgb(rgb),
            fl = luminance(fg),
            contrast = (Math.max(l, fl) + 0.05) / (Math.min(l, fl) + 0.05)
          assert(contrast >= 4.5, `${mode} ${g.name} segment ${i} step ${j}`)
        }
    }
})
test('palette reference matches resolved manifest rows', () => {
  const lines = readFileSync(new URL('../docs/color-palette.md', import.meta.url), 'utf8').split(
    /\r?\n/,
  )
  let section = ''
  let count = 0
  const semanticSections = new Set([
    'Surfaces',
    'Foreground and boundaries',
    'Semantic palettes',
    'Status mappings',
    'Controls',
    'Tables and trees',
    'Finance roles',
    'Categorical series',
    'Chart infrastructure',
    'Candlesticks and depth',
    'Diagrams',
  ])
  for (const line of lines) {
    if (line.startsWith('## ')) section = line.slice(3)
    if (!semanticSections.has(section)) continue
    const match = line.match(/^\| `([a-z0-9-]+)` \| `(#[0-9A-Fa-f]+)` \| `(#[0-9A-Fa-f]+)` \|/)
    if (match) {
      for (const [mode, v] of [
        ['light', match[2]],
        ['dark', match[3]],
      ])
        assert.equal(
          resolve('--aven-color-' + match[1], mode).toUpperCase(),
          v.toUpperCase(),
          `${section}: ${match[1]} ${mode}`,
        )
      count++
    }
  }
  assert.equal(count, 998)
})

test('generated styles are current', async () => {
  const { spawnSync } = await import('node:child_process')
  const result = spawnSync(process.execPath, ['scripts/generate-colors.mjs', '--check'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
})
test('validator rejects broken references, cycles, missing themes and recipes', async () => {
  const { validateColors } = await import('../scripts/colors-contract.mjs')
  for (const mutate of [
    (x) => {
      x.tokens.find((t) => t.kind === 'semantic').light = { ref: '--aven-color-absent' }
    },
    (x) => {
      const t = x.tokens.find((t) => t.kind === 'semantic')
      t.light = { ref: t.name }
    },
    (x) => {
      delete x.tokens.find((t) => t.kind === 'semantic').dark
    },
    (x) => {
      x.gradients[0].count = 9
    },
  ]) {
    const copy = structuredClone(m)
    mutate(copy)
    assert.throws(() => validateColors(copy))
  }
})
test('ramps, scales, and gradient stops match reference', () => {
  const lines = readFileSync(new URL('../docs/color-palette.md', import.meta.url), 'utf8').split(
    /\r?\n/,
  )
  let section = '',
    counts = { ramps: 0, scales: 0, gradients: 0 }
  const hex = (s) => s.match(/#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?/g) || []
  for (const line of lines) {
    if (line.startsWith('## ')) section = line.slice(3)
    if (!line.startsWith('| ')) continue
    const c = line
      .slice(1, -1)
      .split('|')
      .map((s) => s.trim())
    if (section === 'Primitive ramps' && c.length === 12 && hex(line).length === 11) {
      hex(line).forEach((v, i) =>
        assert.equal(
          resolve(
            `--aven-palette-${c[0]}-${[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950][i]}`,
            'light',
          ),
          v,
        ),
      )
      counts.ramps++
    }
    if (section === 'Continuous and discrete data scales' && c.length === 4 && hex(c[1]).length) {
      for (const [mode, column] of [
        ['light', 1],
        ['dark', 2],
      ])
        hex(c[column]).forEach((v, i) =>
          assert.equal(resolve(`--aven-scale-${c[0]}-${String(i + 1).padStart(2, '0')}`, mode), v),
        )
      counts.scales++
    }
    if (section === 'Gradient recipes' && c.length === 6 && hex(c[1]).length) {
      for (const [mode, column] of [
        ['light', 1],
        ['dark', 2],
      ])
        hex(c[column]).forEach((v, i) =>
          assert.equal(
            resolve(`--aven-gradient-${c[0]}-stop-${String(i + 1).padStart(2, '0')}`, mode),
            v,
          ),
        )
      assert.equal(resolve(`--aven-gradient-${c[0]}-fallback`, 'light'), hex(c[3])[0])
      assert.equal(resolve(`--aven-gradient-${c[0]}-fallback`, 'dark'), hex(c[3])[1])
      counts.gradients++
    }
  }
  assert.deepEqual(counts, { ramps: 24, scales: 32, gradients: 149 })
})
test('documented semantic, selection, boundary and focus matrix', () => {
  const families = [
    'neutral',
    'accent',
    'secondary',
    'info',
    'success',
    'warning',
    'danger',
    'critical',
    'gain',
    'loss',
    'buy',
    'sell',
  ]
  for (const mode of ['light', 'dark']) {
    const value = (n) => resolve('--aven-color-' + n, mode)
    const check = (a, b, min) =>
      assert(
        ratio(value(a), value(b)) >= min,
        `${mode}: ${a} on ${b} = ${ratio(value(a), value(b))}`,
      )
    for (const f of families) {
      for (const bg of ['surface-base', 'surface-window', `${f}-subtle`, `${f}-soft`])
        check(`${f}-text`, bg, 4.5)
      for (const bg of [`${f}-solid`, `${f}-hover`, `${f}-pressed`]) check(`${f}-on-solid`, bg, 4.5)
      check(`${f}-border`, 'surface-base', 3)
    }
    for (const fg of [
      'text-primary',
      'text-secondary',
      'text-tertiary',
      'text-placeholder',
      'number-zero',
      'number-missing',
    ])
      for (const bg of [
        'surface-base',
        'surface-window',
        'surface-raised',
        'surface-floating',
        'surface-recessed',
        'surface-hover',
        'surface-pressed',
        'surface-selected',
        'surface-selected-hover',
        'surface-selected-pressed',
      ])
        check(fg, bg, 4.5)
    for (const fg of ['gain-text', 'loss-text'])
      for (const bg of ['surface-selected', 'surface-selected-hover', 'surface-selected-pressed'])
        check(fg, bg, 4.5)
    for (const [fg, bg] of [
      ['selection-text', 'selection-fill'],
      ['match-text', 'match-fill'],
      ['match-current-text', 'match-current-fill'],
    ])
      check(fg, bg, 4.5)
    for (const bg of [
      'surface-base',
      'surface-window',
      'surface-selected',
      'surface-selected-hover',
      'surface-selected-pressed',
      'danger-subtle',
    ])
      check('focus-ring', bg, 3)
    check('border-strong', 'surface-base', 3)
  }
})
test('transparent area stops preserve hue and composite against chart canvas', () => {
  const composite = (fg, bg) =>
    fg
      .slice(1, 7)
      .match(/../g)
      .map((v, i) => {
        const a = parseInt(fg.slice(7, 9), 16) / 255,
          back = parseInt(bg.slice(1 + i * 2, 3 + i * 2), 16)
        return (parseInt(v, 16) * a + back * (1 - a)) / 255
      })
  const mid = composite('#FFFFFF80', '#000000')
  assert(Math.abs(luminanceRgb(mid) - 0.21586) < 0.0001)
  for (const g of m.gradients.filter((g) => g.name.startsWith('area-')))
    for (const mode of ['light', 'dark']) {
      const first = resolve(`--aven-gradient-${g.name}-stop-01`, mode),
        last = resolve(`--aven-gradient-${g.name}-stop-02`, mode),
        canvas = resolve('--aven-color-surface-chart', mode)
      assert.equal(first.slice(0, 7), last.slice(0, 7), g.name)
      assert.equal(last.slice(7), '00', g.name)
      assert.deepEqual(
        composite(last, canvas),
        canvas
          .slice(1)
          .match(/../g)
          .map((x) => parseInt(x, 16) / 255),
      )
      assert(composite(first, canvas).every((x) => x >= 0 && x <= 1))
    }
})
test('established non-color tokens remain unchanged', async () => {
  const { createHash } = await import('node:crypto')
  const css = readFileSync(
    new URL('../packages/shared/src/styles/non-color-tokens.css', import.meta.url),
    'utf8',
  ).replace(/\r\n/g, '\n')
  assert.equal(
    createHash('sha256').update(css).digest('hex'),
    '3bf0c3c42ff93de69e75ecf122b3a0f02c498341b2d9d6ed637daeed8c64ae53',
  )
})
test('100 new gradient family recipes are unique and support their documented use', () => {
  const families = [
      'gray',
      'slate',
      'stone',
      'blue',
      'azure',
      'cyan',
      'teal',
      'emerald',
      'green',
      'lime',
      'amber',
      'orange',
      'coral',
      'red',
      'rose',
      'indigo',
      'violet',
      'purple',
      'magenta',
      'bronze',
    ],
    variants = ['wash', 'veil', 'vivid', 'deep', 'glow'],
    seen = new Set()
  for (const family of families)
    for (const variant of variants) {
      const name = `family-${family}-${variant}`,
        g = m.gradients.find((x) => x.name === name)
      assert(g, `missing ${name}`)
      assert.equal(g.foreground, ['wash', 'veil'].includes(variant) ? 'text-primary' : 'none')
      assert.equal(g.geometry, variant === 'glow' ? 'radial' : '135deg')
      const stops = ['light', 'dark'].flatMap((mode) =>
        [1, 2].map((i) => resolve(`--aven-gradient-${name}-stop-0${i}`, mode)),
      )
      const signature = [g.geometry, ...stops].join('|')
      assert(!seen.has(signature), `duplicate gradient ${name}`)
      seen.add(signature)
    }
  assert.equal(seen.size, 100)
})
test('dark chrome is neutral gray and remains independently themed', () => {
  for (const name of [
    'surface-backdrop',
    'surface-window',
    'surface-base',
    'surface-recessed',
    'surface-raised',
    'surface-floating',
    'surface-hover',
    'surface-pressed',
    'surface-selected',
    'surface-selected-hover',
    'surface-selected-pressed',
    'surface-chart',
    'text-primary',
    'text-secondary',
    'text-tertiary',
    'border-subtle',
    'border-default',
    'border-strong',
  ]) {
    const value = resolve('--aven-color-' + name, 'dark')
    assert(/^#([0-9A-F]{2})\1\1$/i.test(value), `${name}: ${value}`)
  }
  assert.notEqual(
    resolve('--aven-color-surface-base', 'light'),
    resolve('--aven-color-surface-base', 'dark'),
  )
})

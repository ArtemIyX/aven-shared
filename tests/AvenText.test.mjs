import assert from 'node:assert/strict'
import test from 'node:test'
import { createRenderer, createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { AvenText } from '../packages/vue/dist/AvenText.js'

async function renderAvenText(props = {}, slot = 'Example') {
  const app = createSSRApp({
    render: () => h(AvenText, props, { default: () => slot }),
  })

  return renderToString(app)
}

test('uses the documented default HTML element for every visual type', async () => {
  const cases = [
    ['title', 'h1'],
    ['header1', 'h1'],
    ['header2', 'h2'],
    ['header3', 'h3'],
    ['text', 'p'],
    ['quote', 'blockquote'],
    ['caption', 'span'],
  ]

  for (const [type, element] of cases) {
    const html = await renderAvenText({ type })
    assert.ok(html.startsWith('<' + element + ' ') || html.startsWith('<' + element + '>'))
    assert.ok(html.includes('aven-text--' + type))
    assert.ok(html.includes('Example'))
  }
})

test('defaults to text and allows the semantic element to be overridden', async () => {
  const defaultHtml = await renderAvenText()
  assert.ok(defaultHtml.startsWith('<p ') || defaultHtml.startsWith('<p>'))

  const overrideHtml = await renderAvenText({ type: 'header2', as: 'h3' })
  assert.ok(overrideHtml.startsWith('<h3 ') || overrideHtml.startsWith('<h3>'))
  assert.ok(overrideHtml.includes('aven-text--header2'))
})

test('forwards native attributes, class, style, and custom slot markup', async () => {
  const html = await renderAvenText(
    {
      id: 'greeting',
      title: 'Greeting',
      'aria-label': 'Greeting text',
      'data-testid': 'greeting',
      class: 'application-copy',
      style: { color: 'red' },
    },
    ['Hello ', h('strong', 'Avery')],
  )

  assert.ok(html.includes('id="greeting"'))
  assert.ok(html.includes('title="Greeting"'))
  assert.ok(html.includes('aria-label="Greeting text"'))
  assert.ok(html.includes('data-testid="greeting"'))
  assert.ok(html.includes('application-copy'))
  assert.ok(html.includes('color:red'))
  assert.ok(html.includes('Hello <strong>Avery</strong>'))
})

test('applies alignment, tone, clamping and unstyled behavior without changing semantics', async () => {
  const styled = await renderAvenText({
    type: 'header2',
    align: 'end',
    tone: 'warning',
    lineClamp: 2,
  })
  assert.match(styled, /^<h2/)
  assert.match(styled, /aven-text--end/)
  assert.match(styled, /aven-text--warning/)
  assert.match(styled, /aven-text--clamp/)
  assert.match(styled, /--aven-text-line-clamp:\s*2/)
  const unstyled = await renderAvenText({ type: 'header2', unstyled: true, truncate: true })
  assert.match(unstyled, /^<h2/)
  assert.doesNotMatch(unstyled, /aven-text--header2/)
  assert.match(unstyled, /aven-text--truncate/)
})

test('clamped text keeps its complete accessible text content', async () => {
  const content = 'This sentence remains available to assistive technology after visual clamping.'
  const html = await renderAvenText({ lineClamp: 1, 'aria-label': 'Complete description' }, content)
  assert.match(html, /aria-label="Complete description"/)
  assert.match(html, /aven-text--clamp/)
  assert.ok(html.includes(content))
})

test('forwards event listeners to the rendered root element', () => {
  const renderer = createRenderer({
    createElement: (type) => ({ type, props: {}, children: [] }),
    createText: (text) => ({ text }),
    createComment: (text) => ({ comment: text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
    },
    patchProp: (node, key, _previous, next) => {
      node.props[key] = next
    },
    insert: (child, parent) => {
      child.parent = parent
      parent.children.push(child)
    },
    remove: (child) => {
      child.parent.children = child.parent.children.filter((node) => node !== child)
    },
    parentNode: (node) => node.parent ?? null,
    nextSibling: () => null,
  })
  const onClick = () => {}
  const root = { type: 'root', children: [] }

  renderer
    .createApp({
      render: () => h(AvenText, { onClick }),
    })
    .mount(root)

  assert.equal(root.children[0].props.onClick, onClick)
})

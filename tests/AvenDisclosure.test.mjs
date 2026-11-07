import assert from 'node:assert/strict'
import test from 'node:test'
import { createRenderer, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import {
  AvenAccordion,
  AvenBadge,
  AvenButton,
  AvenButtonGroup,
  AvenIconButton,
  AvenIcon,
  AvenField,
  AvenFieldset,
  AvenListbox,
  AvenSlider,
  AvenRangeSlider,
  AvenCombobox,
  AvenMultiSelect,
  AvenContextMenu,
  AvenMenubar,
  AvenAlertDialog,
  AvenDialog,
  AvenCommandPalette,
  AvenLink,
  AvenCollapsible,
  AvenFormattedValue,
  AvenPanel,
  AvenPasswordField,
  AvenRadio,
  AvenRadioGroup,
  AvenToggleButton,
  AvenToggleGroup,
  AvenProvider,
  useAvenConfig,
  AvenSearchField,
  AvenSplitButton,
  AvenStat,
  AvenStatusDot,
} from '../packages/vue/dist/index.js'

async function render(component) {
  return renderToString(createSSRApp(component))
}

test('accordion links headings and panels with unique provider-scoped ids', async () => {
  const html = await render({
    render: () =>
      h(
        AvenProvider,
        { config: { idPrefix: 'test' } },
        {
          default: () => [
            h(
              AvenAccordion,
              { items: [{ key: 'one', label: 'One' }], defaultValue: 'one' },
              { content: ({ item }) => item.label },
            ),
            h(
              AvenAccordion,
              { items: [{ key: 'two', label: 'Two' }] },
              { content: ({ item }) => item.label },
            ),
          ],
        },
      ),
  })
  assert.match(html, /id="test-accordion-1-trigger-0"/)
  assert.match(html, /aria-controls="test-accordion-1-panel-0"/)
  assert.match(html, /aria-labelledby="test-accordion-1-trigger-0"/)
  assert.match(html, /id="test-accordion-2-trigger-0"/)
})

test('generated fallback IDs are unique per app and repeat across SSR app instances', async () => {
  async function renderPair() {
    return render({
      render: () =>
        h('div', [
          h(AvenAccordion, { items: [{ key: 'one', label: 'One' }] }),
          h(AvenAccordion, { items: [{ key: 'two', label: 'Two' }] }),
        ]),
    })
  }
  const first = await renderPair()
  const second = await renderPair()
  const ids = [...first.matchAll(/id="(aven-accordion-[^"]+)"/g)].map((match) => match[1])
  const secondIds = [...second.matchAll(/id="(aven-accordion-[^"]+)"/g)].map((match) => match[1])
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(secondIds, ids)
})

test('provider replaces configuration reactively for injected consumers', async () => {
  const { renderer, root, find } = makeRenderer()
  const config = ref({ locale: 'en-US' })
  const Consumer = defineComponent({
    setup() {
      const providerConfig = useAvenConfig()
      return () => h('span', providerConfig.locale)
    },
  })
  renderer
    .createApp({
      render: () => h(AvenProvider, { config: config.value }, { default: () => h(Consumer) }),
    })
    .mount(root)
  const output = find(root, (node) => node.type === 'span')
  assert.equal(output.text, 'en-US')
  config.value = { locale: 'fr-FR' }
  await nextTick()
  assert.equal(output.text, 'fr-FR')
})

test('field connects required native controls to stable help and error messages', async () => {
  const html = await render({
    render: () =>
      h(
        AvenField,
        {
          id: 'contact-email',
          label: 'Email',
          required: true,
          disabled: true,
          readonly: true,
          description: 'Account notices',
          error: ['Invalid address', 'Use a work email'],
        },
        {
          default: ({ controlAttrs }) => h('input', controlAttrs),
          error: ({ messages }) => messages.join(' / '),
        },
      ),
  })
  assert.match(html, /<label[^>]*for="contact-email"/)
  assert.match(html, /id="contact-email"[^>]*required[^>]*disabled[^>]*readonly/)
  assert.match(html, /aria-describedby="contact-email-description contact-email-error"/)
  assert.match(html, /aria-invalid="true"/)
  assert.match(html, /id="contact-email-description"/)
  assert.match(html, /id="contact-email-error" role="alert"/)
  assert.match(html, /Invalid address \/ Use a work email/)
})

test('fieldset links its description and preserves native disabled behavior', async () => {
  const html = await render({
    render: () =>
      h(
        AvenFieldset,
        { legend: 'Notifications', description: 'Pick any channels.', disabled: true },
        { default: () => h('input', { type: 'checkbox', name: 'updates' }) },
      ),
  })
  const id = html.match(/aria-describedby="([^"]+)"/)
  assert.ok(id)
  assert.match(html, /<fieldset[^>]*disabled/)
  assert.match(html, new RegExp(`<p id="${id[1]}"`))
  assert.match(html, /<legend[^>]*>[\s\S]*?Notifications/)
  assert.match(html, /type="checkbox" name="updates"/)
})

test('collapsible reflects controlled open state and keeps the panel linked', async () => {
  const html = await render({
    render: () =>
      h(AvenProvider, null, {
        default: () =>
          h(
            AvenCollapsible,
            { open: true },
            {
              default: () => 'Disclosure',
              panel: () => 'Panel content',
            },
          ),
      }),
  })
  assert.match(html, /aria-expanded="true"/)
  assert.match(html, /aria-controls="aven-collapsible-1-content"/)
  assert.match(html, /aria-labelledby="aven-collapsible-1-trigger"/)
  assert.match(html, /Panel content/)
})

test('panel renders its semantic heading, named body and footer slots', async () => {
  const html = await render({
    render: () =>
      h(
        AvenPanel,
        { title: 'Summary', description: 'Details' },
        {
          default: () => 'Body copy',
          footer: () => 'Panel actions',
        },
      ),
  })
  assert.match(html, /<h2[^>]*>Summary<\/h2>/)
  assert.match(html, /Details/)
  assert.match(html, /Body copy/)
  assert.match(html, /Panel actions/)
})

test('icon button requires an accessible label and keeps a large target while busy', async () => {
  const html = await render({
    render: () =>
      h(
        AvenIconButton,
        {
          label: 'Close panel',
          tooltip: 'Close this panel',
          shape: 'circle',
          loading: true,
          ui: { root: { attrs: { 'data-action': 'close' } } },
        },
        { default: () => '×' },
      ),
  })
  assert.match(html, /aria-label="Close panel"/)
  assert.match(html, /title="Close this panel"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /data-action="close"/)
  assert.match(html, /icon-button-glyph[^>]*>[\s\S]*?×/)
  assert.match(html, /shape-pill/)
})

test('icon supports decorative and labeled graphics without injecting SVG strings', async () => {
  const decorative = await render({
    render: () => h(AvenIcon, null, { default: () => h('svg', { viewBox: '0 0 24 24' }) }),
  })
  const named = await render({
    render: () =>
      h(
        AvenIcon,
        { decorative: false, label: 'Warning', size: 24, tone: 'warning' },
        { default: () => h('svg', { viewBox: '0 0 24 24' }, [h('path', { d: 'M12 3 2 21h20z' })]) },
      ),
  })
  assert.match(decorative, /aria-hidden="true"/)
  assert.match(named, /role="img" aria-label="Warning"/)
  assert.match(named, /--aven-icon-size:\s*24px/)
  assert.match(named, /<svg[^>]*viewBox="0 0 24 24"/)
})

test('link keeps native navigation, safe blank target defaults, and explicit rel override', async () => {
  const safe = await render({
    render: () =>
      h(AvenLink, { href: 'https://example.test', target: '_blank', external: true }, () => 'Open'),
  })
  const overridden = await render({
    render: () =>
      h(
        AvenLink,
        { href: 'https://example.test', target: '_blank', rel: 'nofollow' },
        () => 'Open',
      ),
  })
  assert.match(safe, /href="https:\/\/example\.test"/)
  assert.match(safe, /target="_blank"/)
  assert.match(safe, /rel="noopener noreferrer"/)
  assert.match(safe, /aria-hidden="true"[^>]*>↗/)
  assert.match(overridden, /rel="nofollow"/)
})

test('badge preserves capped visible count and announces the full count and label', async () => {
  const html = await render({
    render: () => h(AvenBadge, { count: 147, max: 99, label: 'notifications', variant: 'dot' }),
  })
  const zeroHidden = await render({ render: () => h(AvenBadge, { count: 0 }) })
  const zeroShown = await render({ render: () => h(AvenBadge, { count: 0, showZero: true }) })
  assert.match(html, /sr-only[^>]*>147 notifications/)
  assert.match(html, /aria-hidden="true"[^>]*>[\s\S]*?99\+/)
  assert.match(html, /class="badge-dot"/)
  assert.doesNotMatch(zeroHidden, /aven-badge/)
  assert.match(zeroShown, /<!--\[-->0<!--\]-->/)
})

test('status dot supplies text in addition to its semantic color', async () => {
  const html = await render({ render: () => h(AvenStatusDot, { tone: 'critical' }) })
  assert.match(html, /tone-critical/)
  assert.match(html, /aria-hidden="true"[^>]*class="status-dot"/)
  assert.match(html, /sr-only[^>]*>critical status/)
})

test('icon button forwards one native action, blocks disabled action, and exposes focus methods', async () => {
  const { renderer, root, find } = makeRenderer()
  const clicks = []
  const focuses = []
  const blurs = []
  const componentRef = { value: null }
  renderer
    .createApp({
      render: () =>
        h(
          AvenIconButton,
          {
            label: 'Close',
            ref: (instance) => (componentRef.value = instance),
            onClick: (event) => clicks.push(event),
            onFocus: (event) => focuses.push(event),
            onBlur: (event) => blurs.push(event),
          },
          { default: () => '×' },
        ),
    })
    .mount(root)
  const button = find(root, (node) => node.type === 'button')
  const clickEvent = { type: 'click', preventDefault() {} }
  const focusEvent = { type: 'focus' }
  const blurEvent = { type: 'blur' }
  dispatchHandler(button.props.onClick, clickEvent)
  dispatchHandler(button.props.onFocus, focusEvent)
  dispatchHandler(button.props.onBlur, blurEvent)
  assert.deepEqual(clicks, [clickEvent])
  assert.deepEqual(focuses, [focusEvent])
  assert.deepEqual(blurs, [blurEvent])
  componentRef.value.focus()
  assert.equal(button.focused, true)
  componentRef.value.blur()
  assert.equal(button.focused, false)

  const blocked = makeRenderer()
  let blockedClicks = 0
  blocked.renderer
    .createApp({
      render: () =>
        h(AvenIconButton, { label: 'Close', disabled: true, onClick: () => blockedClicks++ }),
    })
    .mount(blocked.root)
  const blockedButton = blocked.find(blocked.root, (node) => node.type === 'button')
  dispatchHandler(blockedButton.props.onClick, { preventDefault() {} })
  assert.equal(blockedClicks, 0)
})

test('button group supplies a labeled semantic group and orientation/attachment styling hooks', async () => {
  const html = await render({
    render: () =>
      h(
        AvenButtonGroup,
        { label: 'View actions', orientation: 'vertical', attached: true, size: 'sm' },
        { default: () => [h('button', 'List'), h('button', 'Board')] },
      ),
  })
  assert.match(html, /role="group" aria-label="View actions"/)
  assert.match(html, /is-vertical size-sm is-attached/)
  assert.match(html, /List/)
  assert.match(html, /Board/)
})

test('button keeps its accessible label, native submit type, and busy slot while loading', async () => {
  const html = await render({
    render: () =>
      h(
        AvenButton,
        {
          type: 'submit',
          loading: true,
          loadingBehavior: 'allow',
          variant: 'soft',
          tone: 'danger',
          shape: 'pill',
          'aria-label': 'Save report',
        },
        {
          default: () => 'Save report',
          loading: ({ loading }) => (loading ? 'busy-marker' : 'idle-marker'),
        },
      ),
  })
  assert.match(html, /<button[^>]*type="submit"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /aria-label="Save report"/)
  assert.match(html, /is-soft tone-danger/)
  assert.match(html, /shape-pill/)
  assert.match(html, /aria-hidden="true"[^>]*class="button-spinner"/)
  assert.match(html, /Save report/)
  assert.match(html, /busy-marker/)
  assert.doesNotMatch(html, /disabled/)
})

test('button emits one native action and focus pair, blocks disabled/busy actions, and exposes focus methods', async () => {
  const { renderer, root, find } = makeRenderer()
  const clicks = []
  const focuses = []
  const blurs = []
  const componentRef = { value: null }
  renderer
    .createApp({
      render: () =>
        h(
          AvenButton,
          {
            ref: (instance) => (componentRef.value = instance),
            onClick: (event) => clicks.push(event),
            onFocus: (event) => focuses.push(event),
            onBlur: (event) => blurs.push(event),
          },
          { default: () => 'Save' },
        ),
    })
    .mount(root)
  const button = find(root, (node) => node.type === 'button')
  const clickEvent = {
    type: 'click',
    prevented: false,
    preventDefault() {
      this.prevented = true
    },
  }
  dispatchHandler(button.props.onClick, clickEvent)
  assert.deepEqual(clicks, [clickEvent])
  const focusEvent = { type: 'focus' }
  const blurEvent = { type: 'blur' }
  dispatchHandler(button.props.onFocus, focusEvent)
  dispatchHandler(button.props.onBlur, blurEvent)
  assert.deepEqual(focuses, [focusEvent])
  assert.deepEqual(blurs, [blurEvent])
  componentRef.value.focus()
  assert.equal(button.focused, true)
  componentRef.value.blur()
  assert.equal(button.focused, false)

  for (const blockedProps of [{ disabled: true }, { loading: true }]) {
    const blockedRenderer = makeRenderer()
    let blockedClicks = 0
    blockedRenderer.renderer
      .createApp({
        render: () =>
          h(
            AvenButton,
            { ...blockedProps, onClick: () => blockedClicks++ },
            { default: () => 'Blocked' },
          ),
      })
      .mount(blockedRenderer.root)
    const blockedButton = blockedRenderer.find(
      blockedRenderer.root,
      (node) => node.type === 'button',
    )
    const blockedEvent = {
      prevented: false,
      preventDefault() {
        this.prevented = true
      },
    }
    dispatchHandler(blockedButton.props.onClick, blockedEvent)
    assert.equal(blockedClicks, 0)
    assert.equal(blockedEvent.prevented, true)
  }
})

test('formatted value localizes valid values and preserves invalid input', async () => {
  const html = await render({
    render: () =>
      h('div', [
        h(AvenFormattedValue, {
          value: 1234.5,
          kind: 'currency',
          currency: 'EUR',
          locale: 'en-US',
        }),
        h(AvenFormattedValue, { value: 'not-a-number', kind: 'number', locale: 'en-US' }),
      ]),
  })
  assert.match(html, /€1,234\.50/)
  assert.match(html, /not-a-number/)
})

test('stat preserves descriptive trend text alongside its value', async () => {
  const html = await render({
    render: () =>
      h(AvenStat, {
        label: 'Revenue',
        value: 120,
        trend: 'up',
        trendLabel: '12% higher',
        description: 'This month',
      }),
  })
  assert.match(html, /Revenue/)
  assert.match(html, /120/)
  assert.match(html, /12% higher/)
  assert.match(html, /This month/)
})

test('specialized input fields connect labels and help text to their native inputs', async () => {
  const html = await render({
    render: () =>
      h(AvenProvider, null, {
        default: () =>
          h('div', [
            h(AvenSearchField, {
              label: 'Find records',
              description: 'Search by name',
              defaultValue: 'A',
            }),
            h(AvenPasswordField, { label: 'Password', required: true }),
          ]),
      }),
  })
  assert.match(html, /for="aven-field-1-control"/)
  assert.match(html, /Find records/)
  assert.match(html, /id="aven-field-1-control" type="search"/)
  assert.match(html, /aria-describedby="aven-field-1-description"/)
  assert.match(html, /for="aven-field-2-control"/)
  assert.match(html, /Password/)
  assert.match(html, /id="aven-field-2-control" type="password"/)
  assert.match(html, /aria-label="Show password"/)
  assert.match(html, /aria-pressed="false"/)
})

function makeRenderer() {
  const createElement = (type) => {
    const listeners = new Map()
    const element = {
      type,
      props: {},
      children: [],
      listeners,
      focused: false,
      querySelector(selector) {
        const predicate = selector === 'input' ? (node) => node.type === 'input' : () => false
        return this.children
          .map((child) => (predicate(child) ? child : child.querySelector?.(selector)))
          .find(Boolean)
      },
      closest(selector) {
        let current = this
        while (current) {
          if (current.type === selector) return current
          current = current.parent
        }
        return null
      },
      addEventListener(name, callback) {
        const callbacks = listeners.get(name) ?? []
        callbacks.push(callback)
        listeners.set(name, callbacks)
      },
      removeEventListener(name, callback) {
        listeners.set(
          name,
          (listeners.get(name) ?? []).filter((handler) => handler !== callback),
        )
      },
      dispatchEvent(event) {
        for (const callback of listeners.get(event.type) ?? []) callback(event)
        return !event.defaultPrevented
      },
      focus() {
        this.focused = true
        this.props.onFocus?.({ target: this })
      },
      blur() {
        this.focused = false
        this.props.onBlur?.({ target: this })
      },
      setCustomValidity(message) {
        this.validationMessage = message
      },
    }
    Object.defineProperty(element, 'form', {
      get() {
        let parent = this.parent
        while (parent) {
          if (parent.type === 'form') return parent
          parent = parent.parent
        }
        return null
      },
    })
    return element
  }
  const renderer = createRenderer({
    createElement,
    createText: (text) => ({ text }),
    createComment: (text) => ({ comment: text }),
    setText: (node, text) => {
      node.text = text
    },
    setElementText: (node, text) => {
      node.text = text
      node.children = []
    },
    patchProp: (node, key, _previous, next) => {
      node.props[key] = next
    },
    insert: (child, parent, anchor = null) => {
      if (child.parent)
        child.parent.children = child.parent.children.filter((item) => item !== child)
      child.parent = parent
      const index = anchor ? parent.children.indexOf(anchor) : -1
      if (index < 0) parent.children.push(child)
      else parent.children.splice(index, 0, child)
    },
    remove: (child) => {
      if (child.parent)
        child.parent.children = child.parent.children.filter((item) => item !== child)
    },
    parentNode: (node) => node.parent ?? null,
    nextSibling: () => null,
  })
  const root = { type: 'root', children: [] }
  const find = (node, predicate) =>
    predicate(node)
      ? node
      : (node.children ?? []).map((child) => find(child, predicate)).find(Boolean)
  return { renderer, root, find }
}

function dispatchHandler(handler, event) {
  for (const callback of Array.isArray(handler) ? handler : [handler]) callback(event)
}

test('listbox exposes stable option semantics, grouped slots, and controlled form values', async () => {
  const html = await render({
    render: () =>
      h(
        AvenListbox,
        {
          id: 'team-list',
          label: 'Teams',
          name: 'team',
          modelValue: 'design',
          options: [
            { value: 'design', label: 'Design', group: 'Product' },
            { value: 'engineering', label: 'Engineering', group: 'Product', disabled: true },
          ],
        },
        {
          group: ({ group }) => `Group ${group}`,
          item: ({ item, selected, disabled }) => `${item.label}:${selected}:${disabled}`,
        },
      ),
  })
  assert.match(html, /role="listbox"[^>]*aria-label="Teams"/)
  assert.match(html, /role="option" aria-selected="true"/)
  assert.match(html, /aria-disabled="true"/)
  assert.match(html, /Group Product/)
  assert.match(html, /name="team" value="design"/)
})

test('listbox keyboard movement skips disabled options and commits once', async () => {
  const { renderer, root, find } = makeRenderer()
  const changes = []
  const ends = []
  renderer
    .createApp({
      render: () =>
        h(AvenListbox, {
          options: [
            { value: 'first', label: 'First' },
            { value: 'blocked', label: 'Blocked', disabled: true },
            { value: 'last', label: 'Last' },
          ],
          defaultValue: 'first',
          onChange: (value) => changes.push(value),
          onEndReached: (payload) => ends.push(payload),
        }),
    })
    .mount(root)
  const list = find(root, (node) => node.props?.role === 'listbox')
  dispatchHandler(list.props.onFocus, { type: 'focus' })
  dispatchHandler(list.props.onKeydown, { key: 'ArrowDown', preventDefault() {} })
  await nextTick()
  assert.equal(list.props['aria-activedescendant']?.endsWith('-option-2'), true)
  dispatchHandler(list.props.onKeydown, { key: 'ArrowDown', preventDefault() {} })
  assert.deepEqual(ends, [{ lastKey: 'last' }])
  dispatchHandler(list.props.onKeydown, { key: 'Enter', preventDefault() {} })
  assert.deepEqual(changes, ['last'])
  dispatchHandler(list.props.onKeydown, { key: 'ArrowUp', preventDefault() {} })
  await nextTick()
  assert.equal(list.props['aria-activedescendant']?.endsWith('-option-0'), true)
})

test('sliders render named native range controls, marks, and thumb-specific values', async () => {
  const html = await render({
    render: () =>
      h('div', [
        h(AvenSlider, {
          id: 'volume',
          label: 'Volume',
          modelValue: 25,
          min: 0,
          max: 100,
          marks: [{ value: 25, label: 'Quarter' }],
        }),
        h(AvenRangeSlider, {
          id: 'price',
          label: 'Price range',
          modelValue: [20, 80],
          startLabel: 'Minimum price',
          endLabel: 'Maximum price',
        }),
      ]),
  })
  assert.match(html, /type="range"[^>]*aria-label="Volume"/)
  assert.match(html, /Quarter/)
  assert.match(html, /role="group" aria-label="Price range"/)
  assert.match(html, /id="price-start"[^>]*aria-label="Minimum price"/)
  assert.match(html, /id="price-end"[^>]*aria-label="Maximum price"/)
  assert.equal((html.match(/type="range"/g) ?? []).length, 3)
})

test('slider clamps native values and range slider preserves thumb gap', async () => {
  const { renderer, root, find } = makeRenderer()
  const singleUpdates = []
  const rangeUpdates = []
  const singleChanges = []
  const rangeChanges = []
  renderer
    .createApp({
      render: () =>
        h('div', [
          h(AvenSlider, {
            defaultValue: 40,
            min: 0,
            max: 100,
            'onUpdate:modelValue': (value) => singleUpdates.push(value),
            onChange: (value) => singleChanges.push(value),
          }),
          h(AvenRangeSlider, {
            defaultValue: [20, 80],
            min: 0,
            max: 100,
            minGap: 10,
            'onUpdate:modelValue': (value) => rangeUpdates.push(value),
            onChange: (value) => rangeChanges.push(value),
          }),
        ]),
    })
    .mount(root)
  const ranges = []
  const collect = (node) => {
    if (node.type === 'input' && node.props.type === 'range') ranges.push(node)
    for (const child of node.children ?? []) collect(child)
  }
  collect(root)
  dispatchHandler(ranges[0].props.onInput, { target: { value: '140' } })
  dispatchHandler(ranges[1].props.onInput, { target: { value: '90' } })
  dispatchHandler(ranges[0].props.onChange, { target: { value: '100' } })
  dispatchHandler(ranges[1].props.onChange, { target: { value: '70' } })
  assert.deepEqual(singleUpdates, [100])
  assert.deepEqual(singleChanges, [100])
  assert.deepEqual(rangeUpdates, [[70, 80]])
  assert.deepEqual(rangeChanges, [[70, 80]])
})

test('uncontrolled sliders restore defaults on native form reset and respect canceled reset', async () => {
  const { renderer, root, find } = makeRenderer()
  renderer
    .createApp({
      render: () =>
        h('form', [
          h(AvenSlider, { name: 'volume', defaultValue: 30 }),
          h(AvenRangeSlider, { name: 'range', defaultValue: [15, 85] }),
        ]),
    })
    .mount(root)
  const form = find(root, (node) => node.type === 'form')
  const ranges = []
  const collect = (node) => {
    if (node.type === 'input' && node.props.type === 'range') ranges.push(node)
    for (const child of node.children ?? []) collect(child)
  }
  collect(form)
  dispatchHandler(ranges[0].props.onInput, { target: { value: '70' } })
  dispatchHandler(ranges[2].props.onInput, { target: { value: '25' } })
  await nextTick()
  assert.equal(ranges[0].props.value, 70)
  assert.equal(ranges[2].props.value, 25)
  form.dispatchEvent({ type: 'reset', defaultPrevented: false })
  await new Promise((resolve) => setImmediate(resolve))
  await nextTick()
  assert.equal(ranges[0].props.value, 30)
  assert.equal(ranges[1].props.value, 15)
  assert.equal(ranges[2].props.value, 85)
  form.addEventListener('reset', (event) => event.preventDefault())
  dispatchHandler(ranges[0].props.onInput, { target: { value: '60' } })
  await nextTick()
  form.dispatchEvent({
    type: 'reset',
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true
    },
  })
  await new Promise((resolve) => setImmediate(resolve))
  await nextTick()
  assert.equal(ranges[0].props.value, 60)
})

test('combobox links its input, help, error, popup, options, and grouped values', async () => {
  const options = [
    { value: 'alpha', label: 'Alpha', group: 'Letters' },
    { value: 'beta', label: 'Beta', group: 'Letters', disabled: true },
  ]
  const html = await render({
    render: () =>
      h('div', [
        h(AvenCombobox, {
          id: 'team-picker',
          label: 'Team',
          description: 'Choose a team.',
          error: 'Required',
          required: true,
          options,
          defaultOpen: true,
        }),
        h(AvenMultiSelect, {
          id: 'topic-picker',
          label: 'Topics',
          name: 'topics',
          options,
          defaultValue: ['alpha'],
        }),
        h(AvenCombobox, {
          id: 'filtered-picker',
          label: 'Filtered options',
          options: [
            { value: 'internal-a', label: 'SECRET-ALPHA' },
            { value: 'internal-b', label: 'VISIBLE-BETA' },
          ],
          defaultQuery: 'beta',
          defaultOpen: true,
        }),
        h(
          AvenCombobox,
          {
            id: 'loading-picker',
            label: 'Async options',
            options,
            loading: true,
            defaultOpen: true,
          },
          {
            loading: () => h('span', { role: 'status' }, 'Loading choices'),
          },
        ),
      ]),
  })
  assert.match(html, /role="combobox"/)
  assert.match(html, /aria-required="true"/)
  assert.match(html, /aria-expanded="true"/)
  assert.match(html, /aria-describedby="team-picker-description team-picker-error"/)
  assert.match(html, /role="listbox"[^>]*aria-multiselectable="true"/)
  assert.match(html, /name="topics" value="alpha"/)
  assert.match(html, /Remove Alpha/)
  assert.match(html, /aria-disabled="true"/)
  assert.match(html, /VISIBLE-BETA/)
  assert.doesNotMatch(html, /SECRET-ALPHA/)
  assert.match(html, /role="status"[^>]*>Loading choices/)
})

test('combobox keyboard selection emits one commit and IME Enter cannot commit early', async () => {
  const { renderer, root, find } = makeRenderer()
  const updates = []
  const changes = []
  const queries = []
  const highlights = []
  const selections = []
  renderer
    .createApp({
      render: () =>
        h(AvenCombobox, {
          options: [
            { value: 'alpha', label: 'Alpha' },
            { value: 'blocked', label: 'Blocked', disabled: true },
            { value: 'beta', label: 'Beta' },
          ],
          defaultOpen: true,
          defaultValue: 'alpha',
          'onUpdate:modelValue': (value) => updates.push(value),
          onChange: (value) => changes.push(value),
          'onUpdate:query': (value) => queries.push(value),
          onHighlight: (payload) => highlights.push(payload.key),
          onSelect: (payload) => selections.push(payload),
        }),
    })
    .mount(root)
  const input = find(root, (node) => node.type === 'input' && node.props.role === 'combobox')
  dispatchHandler(input.props.onKeydown, { key: 'ArrowDown', preventDefault() {} })
  dispatchHandler(input.props.onKeydown, { key: 'ArrowDown', preventDefault() {} })
  const enterEvent = {
    key: 'Enter',
    preventDefault() {},
    stopPropagation() {},
  }
  dispatchHandler(input.props.onKeydown, {
    ...enterEvent,
  })
  assert.deepEqual(updates, ['beta'])
  assert.deepEqual(changes, ['beta'])
  assert.deepEqual(queries, ['Beta'])
  assert.deepEqual(highlights, ['alpha', 'beta'])
  assert.equal(selections.length, 1)
  assert.equal(selections[0].key, 'beta')
  assert.equal(selections[0].originalEvent.key, 'Enter')
  dispatchHandler(input.props.onFocus, { type: 'focus', stopPropagation() {} })
  let prevented = false
  dispatchHandler(input.props.onKeydown, {
    key: 'Enter',
    isComposing: true,
    preventDefault() {
      prevented = true
    },
  })
  assert.equal(prevented, true)
  assert.deepEqual(updates, ['beta'])
})

test('combobox required validity checks selection rather than query text', async () => {
  const { renderer, root, find } = makeRenderer()
  renderer
    .createApp({
      render: () =>
        h(AvenCombobox, {
          options: [{ value: 'alpha', label: 'Alpha' }],
          required: true,
          requiredMessage: 'Choose an option.',
          defaultOpen: true,
        }),
    })
    .mount(root)
  const input = find(root, (node) => node.type === 'input' && node.props.role === 'combobox')
  assert.equal(input.validationMessage, 'Choose an option.')
  dispatchHandler(input.props.onInput, { target: { value: 'unmatched query' } })
  assert.equal(input.validationMessage, 'Choose an option.')
  const option = find(root, (node) => node.props?.role === 'option')
  dispatchHandler(option.props.onClick, { stopPropagation() {} })
  assert.equal(input.validationMessage, '')
})

test('combobox controlled active keys request navigation without mutating rendered state', async () => {
  const { renderer, root, find } = makeRenderer()
  const requests = []
  renderer
    .createApp({
      render: () =>
        h(AvenCombobox, {
          options: [
            { value: 'alpha', label: 'Alpha' },
            { value: 'beta', label: 'Beta' },
          ],
          activeKey: 'alpha',
          defaultOpen: true,
          'onUpdate:activeKey': (key) => requests.push(key),
        }),
    })
    .mount(root)
  const input = find(root, (node) => node.type === 'input' && node.props?.role === 'combobox')
  const originalActiveId = input.props['aria-activedescendant']
  dispatchHandler(input.props.onKeydown, { key: 'ArrowDown', preventDefault() {} })
  assert.deepEqual(requests, ['beta'])
  assert.equal(input.props['aria-activedescendant'], originalActiveId)
})

test('multi-select enforces its limit and removes a selected chip through the library action', async () => {
  const { renderer, root, find } = makeRenderer()
  const updates = []
  const removals = []
  renderer
    .createApp({
      render: () =>
        h(AvenMultiSelect, {
          options: [
            { value: 'alpha', label: 'Alpha' },
            { value: 'beta', label: 'Beta' },
          ],
          defaultValue: ['alpha'],
          defaultOpen: true,
          maxSelected: 1,
          'onUpdate:modelValue': (value) => updates.push(value),
          onRemove: (payload) => removals.push(payload.value),
        }),
    })
    .mount(root)
  const beta = find(
    root,
    (node) =>
      node.props?.role === 'option' && node.children?.some((child) => child.text === 'Beta'),
  )
  dispatchHandler(beta.props.onClick, { stopPropagation() {} })
  assert.deepEqual(updates, [])
  const removeButton = find(
    root,
    (node) => node.type === 'button' && node.props['aria-label'] === 'Remove Alpha',
  )
  dispatchHandler(removeButton.props.onClick, { stopPropagation() {} })
  assert.deepEqual(updates, [[]])
  assert.deepEqual(removals, ['alpha'])
})

test('search waits for IME composition, debounces once, and submits without a duplicate search', async () => {
  const { renderer, root, find } = makeRenderer()
  const searches = []
  const submits = []
  renderer
    .createApp({
      render: () =>
        h(AvenSearchField, {
          debounce: 8,
          onSearch: (value) => searches.push(value),
          onSubmit: (value) => submits.push(value),
        }),
    })
    .mount(root)
  const input = find(root, (node) => node.type === 'input')
  input.props.onCompositionstart({})
  input.props.onInput({ target: { value: '日本' } })
  await new Promise((resolve) => setTimeout(resolve, 12))
  assert.equal(searches.length, 0)
  input.props.onCompositionend({ target: { value: '日本' } })
  await new Promise((resolve) => setTimeout(resolve, 16))
  assert.deepEqual(searches, [{ query: '日本' }])
  input.props.onKeydown({ key: 'Enter', keyCode: 13, isComposing: false, preventDefault() {} })
  assert.deepEqual(
    submits.map((item) => item.query),
    ['日本'],
  )
  assert.equal(searches.length, 1)
})

test('password reveal is a single button action and disabled state blocks it', async () => {
  const { renderer, root, find } = makeRenderer()
  const revealedValues = []
  renderer
    .createApp({
      render: () =>
        h(AvenPasswordField, { 'onUpdate:revealed': (value) => revealedValues.push(value) }),
    })
    .mount(root)
  find(root, (node) => node.props?.class?.includes?.('password-reveal')).props.onClick({})
  assert.deepEqual(revealedValues, [true])
  await nextTick()
  assert.equal(find(root, (node) => node.type === 'input').props.type, 'text')
  const disabled = makeRenderer()
  let disabledEmits = 0
  disabled.renderer
    .createApp({
      render: () =>
        h(AvenPasswordField, { disabled: true, 'onUpdate:revealed': () => disabledEmits++ }),
    })
    .mount(disabled.root)
  disabled
    .find(disabled.root, (node) => node.props?.class?.includes?.('password-reveal'))
    .props.onClick({})
  assert.equal(disabledEmits, 0)
})

test('specialized fields restore their default values on native form reset', async () => {
  const { renderer, root, find } = makeRenderer()
  const searchValues = []
  const passwordValues = []
  const revealedValues = []
  renderer
    .createApp({
      render: () =>
        h('form', [
          h(AvenSearchField, {
            modelValue: 'edited query',
            defaultValue: 'initial query',
            'onUpdate:modelValue': (value) => searchValues.push(value),
          }),
          h(AvenPasswordField, {
            modelValue: 'edited secret',
            defaultValue: 'initial secret',
            revealed: true,
            defaultRevealed: false,
            'onUpdate:modelValue': (value) => passwordValues.push(value),
            'onUpdate:revealed': (value) => revealedValues.push(value),
          }),
        ]),
    })
    .mount(root)
  const form = find(root, (node) => node.type === 'form')
  assert.equal(find(root, (node) => node.type === 'input').form, form)
  assert.equal(form.listeners.get('reset')?.length, 2)
  form.dispatchEvent({ type: 'reset', defaultPrevented: false })
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.deepEqual(searchValues, ['initial query'])
  assert.deepEqual(passwordValues, ['initial secret'])
  assert.deepEqual(revealedValues, [false])
})

test('radio group exposes native fieldset semantics, described errors, slots, and form values', async () => {
  const html = await render({
    render: () =>
      h(
        AvenRadioGroup,
        {
          id: 'plan-choice',
          name: 'plan',
          label: 'Plan',
          description: 'Choose a plan',
          error: 'Choose one plan',
          required: true,
          items: [
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly', disabled: true },
          ],
          defaultValue: 'monthly',
        },
        {
          item: ({ item, selected, active }) =>
            h('span', `custom-${item.value}-${selected}-${active}`),
        },
      ),
  })
  assert.match(html, /<fieldset[^>]*id="plan-choice"[^>]*aria-invalid="true"/)
  assert.match(html, /aria-describedby="plan-choice-description plan-choice-error"/)
  assert.match(html, /name="plan" value="monthly" checked required/)
  assert.match(html, /name="plan" value="yearly" disabled required/)
  assert.match(html, /Choose a plan/)
  assert.match(html, /custom-monthly-true-false/)
  assert.match(html, /id="plan-choice-error"[^>]*role="alert"/)
})

test('radio group updates once on selection and suppresses disabled or unchanged options', async () => {
  const { renderer, root, find } = makeRenderer()
  const values = []
  const changes = []
  renderer
    .createApp({
      render: () =>
        h(AvenRadioGroup, {
          items: [
            { value: 'basic', label: 'Basic' },
            { value: 'pro', label: 'Pro' },
            { value: 'locked', label: 'Locked', disabled: true },
          ],
          defaultValue: 'basic',
          'onUpdate:modelValue': (value) => values.push(value),
          onChange: (value) => changes.push(value),
        }),
    })
    .mount(root)
  const inputs = []
  const visit = (node) => {
    if (node.type === 'input') inputs.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(root)
  assert.equal(inputs[0].props.name, inputs[1].props.name)
  assert.equal(inputs[1].props.value, 'pro')
  inputs[1].props.onChange({ target: { checked: true } })
  await nextTick()
  assert.deepEqual(values, ['pro'])
  assert.deepEqual(changes, ['pro'])
  assert.equal(inputs[1].props.checked, true)
  inputs[1].props.onChange({ target: { checked: true } })
  inputs[2].props.onChange({ target: { checked: true } })
  assert.deepEqual(values, ['pro'])
})

test('standalone radio preserves native activation and emits one typed selection payload', async () => {
  const { renderer, root, find } = makeRenderer()
  const updates = []
  const selections = []
  renderer
    .createApp({
      render: () =>
        h(AvenRadio, {
          value: 42,
          name: 'answer',
          label: 'Forty two',
          description: 'The answer',
          'onUpdate:checked': (value) => updates.push(value),
          onChange: (payload) => selections.push(payload),
        }),
    })
    .mount(root)
  const input = find(root, (node) => node.type === 'input')
  assert.equal(input.props.type, 'radio')
  assert.equal(input.props.name, 'answer')
  assert.equal(input.props.value, '42')
  const event = { target: { checked: true } }
  input.props.onChange(event)
  assert.deepEqual(updates, [true])
  assert.equal(selections[0].value, 42)
  assert.equal(selections[0].checked, true)
  assert.equal(selections[0].originalEvent, event)
})

test('uncontrolled radio group restores its default choice after native form reset', async () => {
  const { renderer, root, find } = makeRenderer()
  renderer
    .createApp({
      render: () =>
        h('form', [
          h(AvenRadioGroup, {
            name: 'format',
            defaultValue: 'compact',
            items: [
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfortable' },
            ],
          }),
        ]),
    })
    .mount(root)
  const form = find(root, (node) => node.type === 'form')
  const inputs = []
  const visit = (node) => {
    if (node.type === 'input') inputs.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(form)
  inputs[1].props.onChange({ target: { checked: true } })
  await nextTick()
  assert.equal(inputs[1].props.checked, true)
  form.dispatchEvent({ type: 'reset', defaultPrevented: false })
  await new Promise((resolve) => setTimeout(resolve, 5))
  await nextTick()
  assert.equal(inputs[0].props.checked, true)
  assert.equal(inputs[1].props.checked, false)
})

test('radio group leaves uncontrolled state intact when form reset is canceled', async () => {
  const { renderer, root, find } = makeRenderer()
  renderer
    .createApp({
      render: () =>
        h('form', [
          h(AvenRadioGroup, {
            name: 'layout',
            defaultValue: 'list',
            items: [
              { value: 'list', label: 'List' },
              { value: 'grid', label: 'Grid' },
            ],
          }),
        ]),
    })
    .mount(root)
  const form = find(root, (node) => node.type === 'form')
  const inputs = []
  const visit = (node) => {
    if (node.type === 'input') inputs.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(form)
  inputs[1].props.onChange({ target: { checked: true } })
  await nextTick()
  form.addEventListener('reset', (event) => {
    event.defaultPrevented = true
  })
  form.dispatchEvent({ type: 'reset', defaultPrevented: false })
  await new Promise((resolve) => setTimeout(resolve, 5))
  await nextTick()
  assert.equal(inputs[0].props.checked, false)
  assert.equal(inputs[1].props.checked, true)
})

test('toggle button updates pressed state once and blocks disabled activation', async () => {
  const { renderer, root, find } = makeRenderer()
  const updates = []
  const changes = []
  let nativeClicks = 0
  renderer
    .createApp({
      render: () =>
        h(AvenToggleButton, {
          defaultValue: false,
          'onUpdate:modelValue': (value) => updates.push(value),
          onChange: (value) => changes.push(value),
          onClick: () => nativeClicks++,
        }),
    })
    .mount(root)
  const button = find(root, (node) => node.type === 'button')
  assert.equal(button.props.type, 'button')
  assert.equal(button.props['aria-pressed'], false)
  dispatchHandler(button.props.onClick, {})
  await nextTick()
  assert.deepEqual(updates, [true])
  assert.deepEqual(changes, [true])
  assert.equal(nativeClicks, 1)
  assert.equal(find(root, (node) => node.type === 'button').props['aria-pressed'], true)
  const disabled = makeRenderer()
  let disabledUpdates = 0
  disabled.renderer
    .createApp({
      render: () =>
        h(AvenToggleButton, { disabled: true, 'onUpdate:modelValue': () => disabledUpdates++ }),
    })
    .mount(disabled.root)
  disabled.find(disabled.root, (node) => node.type === 'button').props.onClick({})
  assert.equal(disabledUpdates, 0)
})

test('toggle group supports multiple values, native form fields, disabled items, and allowEmpty', async () => {
  const { renderer, root, find } = makeRenderer()
  const updates = []
  const changes = []
  renderer
    .createApp({
      render: () =>
        h(AvenToggleGroup, {
          name: 'format',
          label: 'Format',
          multiple: true,
          allowEmpty: false,
          defaultValue: ['bold'],
          items: [
            { value: 'bold', label: 'Bold' },
            { value: 'italic', label: 'Italic' },
            { value: 'locked', label: 'Locked', disabled: true },
          ],
          'onUpdate:modelValue': (value) => updates.push(value),
          onChange: (value) => changes.push(value),
        }),
    })
    .mount(root)
  const buttons = []
  const inputs = []
  const visit = (node) => {
    if (node.type === 'button') buttons.push(node)
    if (node.type === 'input') inputs.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(root)
  const group = find(root, (node) => node.props?.role === 'toolbar')
  assert.equal(group.props['aria-label'], 'Format')
  assert.equal(buttons.length, 3)
  assert.equal(buttons[0].props['aria-pressed'], true)
  assert.deepEqual(
    inputs.map((input) => [input.props.name, input.props.value]),
    [['format', 'bold']],
  )
  buttons[1].props.onClick({})
  await nextTick()
  assert.deepEqual(updates, [['bold', 'italic']])
  assert.deepEqual(changes, [['bold', 'italic']])
  buttons.length = 0
  inputs.length = 0
  visit(root)
  assert.deepEqual(
    inputs.filter((input) => input.props.type === 'hidden').map((input) => input.props.value),
    ['bold', 'italic'],
  )
  buttons[0].props.onClick({})
  await nextTick()
  assert.deepEqual(updates, [['bold', 'italic'], ['italic']])
  buttons[2].props.onClick({})
  buttons[1].props.onClick({})
  assert.equal(updates.length, 2)
})

test('toggle group arrow navigation moves focus without changing selection', async () => {
  const { renderer, root } = makeRenderer()
  const updates = []
  const slotStates = []
  renderer
    .createApp({
      render: () =>
        h(
          AvenToggleGroup,
          {
            defaultValue: 'first',
            label: 'View mode',
            items: [
              { value: 'first', label: 'First' },
              { value: 'disabled', label: 'Disabled', disabled: true },
              { value: 'last', label: 'Last' },
            ],
            'onUpdate:modelValue': (value) => updates.push(value),
          },
          {
            item: ({ item, active }) => {
              slotStates.push([item.value, active])
              return h('span', item.label)
            },
          },
        ),
    })
    .mount(root)
  const buttons = []
  const visit = (node) => {
    if (node.type === 'button') buttons.push(node)
    for (const child of node.children ?? []) visit(child)
  }
  visit(root)
  let prevented = false
  buttons[0].props.onKeydown({ key: 'ArrowRight', preventDefault: () => (prevented = true) })
  await nextTick()
  assert.equal(prevented, true)
  assert.deepEqual(updates, [])
  assert.equal(buttons[2].props.tabindex, 0)
  assert.equal(slotStates.at(-1)[0], 'last')
  assert.equal(slotStates.at(-1)[1], true)
})

test('split button separates its primary action from menu open/select and restores focus', async () => {
  const { renderer, root } = makeRenderer()
  const primaryClicks = []
  const selected = []
  const openUpdates = []
  const openChanges = []
  const commands = [
    { key: 'copy', label: 'Copy link' },
    { key: 'archive', label: 'Archive', disabled: true },
  ]
  renderer
    .createApp({
      render: () =>
        h(AvenSplitButton, {
          items: commands,
          label: 'Project actions',
          'onUpdate:open': (value) => openUpdates.push(value),
          onOpenChange: (value) => openChanges.push(value),
          onClick: (event) => primaryClicks.push(event),
          onSelect: (payload) => selected.push(payload),
        }),
    })
    .mount(root)
  const findAll = (predicate) => {
    const matches = []
    const visit = (node) => {
      if (predicate(node)) matches.push(node)
      for (const child of node.children ?? []) visit(child)
    }
    visit(root)
    return matches
  }
  let buttons = findAll((node) => node.type === 'button')
  assert.equal(buttons.length, 2)
  const primaryEvent = { type: 'click', target: buttons[0] }
  dispatchHandler(buttons[0].props.onClick, primaryEvent)
  assert.deepEqual(primaryClicks, [primaryEvent])
  assert.deepEqual(openUpdates, [])
  const trigger = buttons[1]
  let openKeyPrevented = false
  dispatchHandler(trigger.props.onKeydown, {
    key: 'ArrowDown',
    preventDefault: () => (openKeyPrevented = true),
  })
  await nextTick()
  await nextTick()
  assert.equal(openKeyPrevented, true)
  assert.deepEqual(primaryClicks, [primaryEvent])
  assert.deepEqual(openUpdates, [true])
  assert.deepEqual(openChanges, [{ open: true, reason: 'trigger' }])
  buttons = findAll((node) => node.type === 'button')
  assert.equal(buttons.length, 4)
  assert.equal(buttons[2].props.role, 'menuitem')
  assert.equal(buttons[3].props.disabled, true)
  const selectEvent = { type: 'click', target: buttons[2] }
  dispatchHandler(buttons[2].props.onClick, selectEvent)
  await nextTick()
  await nextTick()
  assert.equal(selected.length, 1)
  assert.equal(selected[0].key, 'copy')
  assert.equal(selected[0].item.label, 'Copy link')
  assert.equal(selected[0].originalEvent, selectEvent)
  assert.deepEqual(openUpdates, [true, false])
  assert.deepEqual(openChanges, [
    { open: true, reason: 'trigger' },
    { open: false, reason: 'select' },
  ])
  assert.equal(trigger.focused, true)
  assert.deepEqual(primaryClicks, [primaryEvent])
})

test('split button keeps primary, menu, and controlled-open state independent', async () => {
  const controlled = makeRenderer()
  const openRequests = []
  const primaryRequests = []
  controlled.renderer
    .createApp({
      render: () =>
        h(AvenSplitButton, {
          items: [{ key: 'copy', label: 'Copy' }],
          open: false,
          primaryDisabled: true,
          'onUpdate:open': (value) => openRequests.push(value),
          onClick: (event) => primaryRequests.push(event),
        }),
    })
    .mount(controlled.root)
  const controlledButtons = []
  const visitControlled = (node) => {
    if (node.type === 'button') controlledButtons.push(node)
    for (const child of node.children ?? []) visitControlled(child)
  }
  visitControlled(controlled.root)
  assert.equal(controlledButtons[0].props.disabled, true)
  assert.equal(controlledButtons[1].props.disabled, false)
  dispatchHandler(controlledButtons[1].props.onClick, {})
  await nextTick()
  assert.deepEqual(openRequests, [true])
  assert.deepEqual(primaryRequests, [])
  assert.equal(
    controlledButtons.some((button) => button.props.role === 'menuitem'),
    false,
  )

  const menuDisabled = makeRenderer()
  const menuPrimary = []
  menuDisabled.renderer
    .createApp({
      render: () =>
        h(AvenSplitButton, {
          items: [{ key: 'copy', label: 'Copy' }],
          menuDisabled: true,
          onClick: (event) => menuPrimary.push(event),
        }),
    })
    .mount(menuDisabled.root)
  const menuDisabledButtons = []
  const visitMenuDisabled = (node) => {
    if (node.type === 'button') menuDisabledButtons.push(node)
    for (const child of node.children ?? []) visitMenuDisabled(child)
  }
  visitMenuDisabled(menuDisabled.root)
  assert.equal(menuDisabledButtons[0].props.disabled, false)
  assert.equal(menuDisabledButtons[1].props.disabled, true)
  dispatchHandler(menuDisabledButtons[0].props.onClick, { type: 'click' })
  assert.equal(menuPrimary.length, 1)
})

test('context menu opens from pointer and keyboard with a visible touch trigger', async () => {
  const html = await render({
    render: () =>
      h(AvenContextMenu, {
        label: 'Project actions',
        items: [{ key: 'copy', label: 'Copy link' }],
      }),
  })
  assert.match(html, /aria-haspopup="menu"/)
  assert.match(html, /aria-label="More actions"/)
  const mounted = makeRenderer()
  const changes = []
  const updates = []
  const selections = []
  mounted.renderer
    .createApp({
      render: () =>
        h(AvenContextMenu, {
          items: [{ key: 'copy', label: 'Copy link' }],
          label: 'Project actions',
          onOpenChange: (change) => changes.push(change),
          onSelect: (selection) => selections.push(selection),
          'onUpdate:open': (value) => updates.push(value),
        }),
    })
    .mount(mounted.root)
  const root = mounted.find(mounted.root, (node) => typeof node.props?.onContextmenu === 'function')
  const prevented = { value: false }
  root.props.onContextmenu({
    clientX: 18,
    clientY: 24,
    preventDefault() {
      prevented.value = true
    },
  })
  await nextTick()
  assert.equal(prevented.value, true)
  assert.deepEqual(updates, [true])
  assert.deepEqual(changes, [{ open: true, reason: 'contextmenu', point: { x: 18, y: 24 } }])
  const touchButton = mounted.find(mounted.root, (node) => node.type === 'button')
  assert.equal(touchButton.props['aria-label'], 'More actions')
  touchButton.props.onClick({ currentTarget: null, preventDefault() {} })
  assert.deepEqual(updates, [true])
  const menuItem = mounted.find(
    mounted.root,
    (node) => node.type === 'button' && node.props?.role === 'menuitem',
  )
  dispatchHandler(menuItem.props.onClick, { type: 'click' })
  await nextTick()
  assert.equal(selections.length, 1)
  assert.equal(selections[0].key, 'copy')
  assert.deepEqual(updates, [true, false])
  assert.deepEqual(
    changes.map(({ reason }) => reason),
    ['contextmenu', 'selection'],
  )
})

test('menubar moves active items and opens/selects a submenu with one selection event', async () => {
  const mounted = makeRenderer()
  const activeRequests = []
  const openRequests = []
  const submenuChanges = []
  const selections = []
  mounted.renderer
    .createApp({
      render: () =>
        h(AvenMenubar, {
          label: 'Document menu',
          items: [
            { key: 'file', label: 'File', children: [{ key: 'new', label: 'New' }] },
            { key: 'edit', label: 'Edit', children: [{ key: 'rename', label: 'Rename' }] },
          ],
          'onUpdate:activeKey': (key) => activeRequests.push(key),
          'onUpdate:openKey': (key) => openRequests.push(key),
          onSubmenuChange: (change) => submenuChanges.push(change),
          onSelect: (payload) => selections.push(payload),
        }),
    })
    .mount(mounted.root)
  const menubar = mounted.find(mounted.root, (node) => node.props?.role === 'menubar')
  assert.equal(menubar.props['aria-label'], 'Document menu')
  const triggers = []
  const visitTriggers = (node) => {
    if (node.props?.role === 'menuitem' && node.type === 'button') triggers.push(node)
    for (const child of node.children ?? []) visitTriggers(child)
  }
  visitTriggers(menubar)
  dispatchHandler(triggers[0].props.onKeydown, {
    key: 'ArrowRight',
    preventDefault() {},
  })
  await nextTick()
  assert.deepEqual(activeRequests, ['edit'])
  dispatchHandler(triggers[0].props.onClick, { type: 'click' })
  await nextTick()
  assert.deepEqual(openRequests, ['file'])
  dispatchHandler(triggers[1].props.onClick, { type: 'click' })
  await nextTick()
  assert.deepEqual(openRequests, ['file', 'edit'])
  assert.deepEqual(submenuChanges, [
    { key: 'file', open: true },
    { key: 'file', open: false },
    { key: 'edit', open: true },
  ])
  const submenu = mounted.find(mounted.root, (node) => node.props?.role === 'menu')
  assert.ok(submenu)
  const newItem = mounted.find(
    submenu,
    (node) => node.type === 'button' && node.props?.role === 'menuitem',
  )
  dispatchHandler(newItem.props.onClick, { type: 'click' })
  await nextTick()
  assert.equal(selections.length, 1)
  assert.equal(selections[0].key, 'rename')
  assert.deepEqual(openRequests, ['file', 'edit', null])
})

test('dialog links its accessible title and description and alert dialog requests actions once', async () => {
  const dialogHtml = await render({
    render: () => h(AvenDialog, { title: 'Preferences', description: 'Choose your defaults.' }),
  })
  assert.match(dialogHtml, /<dialog[^>]*aria-labelledby="aven-dialog-\d+-title"/)
  assert.match(dialogHtml, /aria-describedby="aven-dialog-\d+-description"/)
  const html = await render({
    render: () =>
      h(AvenAlertDialog, {
        title: 'Delete project?',
        description: 'This cannot be undone.',
      }),
  })
  assert.match(html, /role="alertdialog"/)
  assert.match(html, /aria-labelledby="aven-dialog-\d+-title"/)
  assert.match(html, /aria-describedby="aven-dialog-\d+-description"/)
  assert.match(html, />Cancel<\/button>/)
  assert.match(html, /Confirm.*<\/button>/)

  const disabled = makeRenderer()
  disabled.renderer
    .createApp({
      render: () => h(AvenAlertDialog, { title: 'Wait', loading: true }),
    })
    .mount(disabled.root)
  const disabledButtons = []
  const visitDisabled = (node) => {
    if (node.type === 'button') disabledButtons.push(node)
    for (const child of node.children ?? []) visitDisabled(child)
  }
  visitDisabled(disabled.root)
  assert.equal(disabledButtons.length, 2)
  assert.ok(disabledButtons.every((button) => button.props.disabled))

  const mounted = makeRenderer()
  const confirms = []
  const cancels = []
  mounted.renderer
    .createApp({
      render: () =>
        h(AvenAlertDialog, {
          title: 'Delete project?',
          onConfirm: (payload) => confirms.push(payload),
          onCancel: (payload) => cancels.push(payload),
        }),
    })
    .mount(mounted.root)
  const actionButtons = []
  const visitActions = (node) => {
    if (node.type === 'button') actionButtons.push(node)
    for (const child of node.children ?? []) visitActions(child)
  }
  visitActions(mounted.root)
  const actionEvent = { type: 'click' }
  dispatchHandler(actionButtons[1].props.onClick, actionEvent)
  dispatchHandler(actionButtons[0].props.onClick, actionEvent)
  assert.deepEqual(confirms, [{ originalEvent: actionEvent }])
  assert.deepEqual(cancels, [{ originalEvent: actionEvent }])
})

test('command palette opens as a grouped search dialog and requests one command', async () => {
  const commands = [
    { key: 'open', label: 'Open file', group: 'File', shortcut: 'Ctrl+O' },
    { key: 'sidebar', label: 'Toggle sidebar', group: 'View', disabled: true },
  ]
  const html = await render({
    render: () =>
      h(AvenCommandPalette, {
        items: commands,
        label: 'Commands',
        defaultOpen: true,
        defaultQuery: 'file',
      }),
  })
  assert.match(html, /<dialog/)
  assert.match(html, /role="combobox"/)
  assert.match(html, /role="listbox"/)
  assert.match(html, /Open file/)
  assert.match(html, /Ctrl\+O/)

  const mounted = makeRenderer()
  const selections = []
  const paletteRef = ref(null)
  const app = mounted.renderer.createApp({
    render: () =>
      h(AvenCommandPalette, {
        ref: paletteRef,
        items: [{ key: 'run', label: 'Run task' }],
        onSelect: (payload) => selections.push(payload),
      }),
  })
  app.mount(mounted.root)
  paletteRef.value.open()
  await nextTick()
  await nextTick()
  const option = mounted.find(mounted.root, (node) => node.props?.role === 'option')
  const originalEvent = { type: 'click' }
  dispatchHandler(option.props.onClick, originalEvent)
  assert.equal(selections.length, 1)
  assert.equal(selections[0].key, 'run')
  assert.equal(selections[0].item.label, 'Run task')
  assert.equal(selections[0].originalEvent, originalEvent)
})

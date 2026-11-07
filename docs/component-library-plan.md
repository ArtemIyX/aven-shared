# Shared Vue component library specification

Research date: 2026-11-05. Target: `@wellsaik/aven-vue` for future Vue components, including browser and Tauri applications.

Status: design contract and implementation backlog. Check [component implementation status](component-implementation-status.md) for source, exports, examples, and verification; do not infer completion from a catalog entry.

## Reading map

- [Research across 16 apps](app-component-research.md): source evidence, observations, and design conclusions.
- [Detailed component catalog](component-catalog.md): individual styles, props, events, slots, and behavior.
- [Current theme palette](component-theme-reference.md): values extracted from the existing token manifest.

## 1. Repository baseline

`@wellsaik/aven-vue` owns AvenText and Vue components in `packages/vue/src`, with Vue `^3.3.0` as a peer. Component CSS is explicitly imported from `@wellsaik/aven-vue/style.css`. The framework-independent `@wellsaik/aven-shared` owns tokens and themes; the Vue package depends on its public package exports.

`packages/shared/src/tokens/colors.json` is the color source of truth. Generated CSS supports light, dark, system, enhanced contrast, forced colors and print. Optional finance, chart, diagram and gradient entries remain shared. Preserve AvenText behavior and customization hooks.

The neighboring `aven-folio` repository is still a starter app and has no dependency on this package. Its template colors should not replace the shared palette. This specification belongs to the shared repository's `docs/` directory.

## 2. Product boundaries

Build small components with strong default behavior, typed composition, scoped internal styles, and stable public customization hooks. Keep network calls, routing decisions, authentication, persistence, financial rules, and application-specific entities in consuming apps.

Provide useful defaults plus composable parts. For example, `AvenSelect` handles a value choice, `AvenDropdownMenu` handles commands, `AvenPopover` holds arbitrary interactive content, and `AvenTooltip` provides a short noninteractive description. Their placement code can be shared; their semantics cannot be interchangeable.

Avoid one component with every imaginable prop. Extend with named slots, typed item models, compound parts, and small adapters. Static components do not need invented events merely to have events. A passive icon, separator, or card forwards ordinary applicable DOM listeners but has no domain action of its own.

## 3. Universal public contract

### Props and native attributes

All components support `id`, `class`, `style`, `data-*`, and applicable `aria-*`. Root styling and semantic control attributes must have documented targets. Compound field components use `inheritAttrs: false`: root `class/style` apply to the wrapper; `id`, `name`, `autocomplete`, `aria-*`, and form constraints apply to the actual control. Expose typed `controlAttrs` and `rootAttrs` when both targets need explicit attributes. Do not silently apply an input's `required` to a wrapping div.

Common props are opt-in by component category:

| Contract   | Type / default                                                                         | Applies to                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `size`     | `'xs'\|'sm'\|'md'\|'lg'`, default `md`                                                 | Controls, badges, avatars; only documented sizes per component                                                |
| `density`  | `'compact'\|'comfortable'\|'spacious'`, default `comfortable`                          | Lists, menus, tables and shells                                                                               |
| `tone`     | `'neutral'\|'accent'\|'secondary'\|'info'\|'success'\|'warning'\|'danger'\|'critical'` | Components with semantic coloring; default neutral except primary action                                      |
| `variant`  | Component-specific union                                                               | Button solid/soft/outline/ghost/link, field outline/filled/underline, etc.                                    |
| `disabled` | `boolean=false`                                                                        | Action and form controls, not arbitrary content containers                                                    |
| `readonly` | `boolean=false`                                                                        | Value fields; remains focusable and participates in form submission                                           |
| `loading`  | `boolean=false`                                                                        | Controls or surfaces waiting for app-owned work                                                               |
| `invalid`  | `boolean=false`                                                                        | Fields; sets `aria-invalid`, linked error text and invalid boundary                                           |
| `unstyled` | `boolean=false`                                                                        | Removes visual skin while retaining semantics, interaction, essential positioning and visually hidden helpers |
| `ui`       | Typed map of part name to `{class?, style?, attrs?}`                                   | Public parts such as label, control, content, indicator, item                                                 |
| `dir`      | `'ltr'\|'rtl'`, inherited by default                                                   | Logical layout; provider default with local override                                                          |
| `locale`   | BCP 47 string, inherited; deterministic configured fallback                            | Formatting and translated labels                                                                              |

Use `type` for native button/input types; avoid overloading it for appearance. Preserve the existing AvenText `type` API. Avoid arbitrary `as` on controls: button and link semantics require separate supported render modes. A router-link integration is an optional adapter or scoped link slot, with no hard Vue Router dependency.

### Models and events

- Controlled values use `modelValue` + `update:modelValue(next)`. Uncontrolled mode uses `defaultValue` read once at mount. A supplied controlled value, including `null`, takes precedence; never mutate props.
- Open state uses `open` + `update:open(boolean)` and optional `defaultOpen=false`. State proposals do not override a controlled parent's value.
- `update:modelValue` reports each accepted edit. `change` reports user commitment (native change, selected option, slider release). Specify per-component timing in the catalog. Parent prop updates emit neither event.
- `focus(FocusEvent)`, `blur(FocusEvent)`, `keydown(KeyboardEvent)` and native action events target the documented semantic element. Declare/re-emit a DOM event only when needed; never emit it and also forward the same listener, which causes duplicates. Button `click(MouseEvent)` covers native keyboard activation too.
- Semantic events use named objects: `select({key,item,originalEvent})`, `remove({key,originalEvent})`, `reorder({keys,from,to,originalEvent})`. Values/keys are stable primitives; an item is original consumer data. `originalEvent` is optional for non-DOM causes.
- `openChange({open,reason})` accompanies open-state proposals; `reason` is `trigger|select|escape|outside|programmatic`. `afterOpen`/`afterClose` occur after the rendered transition, including reduced-motion completion.
- Cancellable dismissals use `beforeClose({reason,originalEvent,preventDefault})`, called before proposing close; do not imply that Vue emits return a cancellation result. Required modal confirmation belongs to app logic.
- Disabled and loading-blocked actions do not emit action/change events. Readonly values do not change. Loading does not erase visible labels or values.

Use explicit generic TypeScript types for item keys, values, option/group records, columns and slot scopes. Export prop, emit and slot types alongside each public component. Refs expose only useful methods (`focus`, `blur`, `select`, `open`, `close`, `scrollToKey` as applicable), not internal DOM ownership.

### Slots and parts

Slots replace a specific region, keeping an accessible outer structure. Common names: `default`, `label`, `description`, `error`, `leading`, `trailing`, `icon`, `loading`, `header`, `footer`, `actions`, `empty`, `item`, `separator`. Only expose slots meaningful to that component.

Slot payloads contain state and actions, not mutable internal refs: `{disabled,loading,invalid}`, `{item,key,index,selected,active,disabled}`, or `{open,close}`. Item slots replace visual content inside library-owned semantic options/menuitems; `ui.item` targets that outer node. A trigger slot receives `{triggerAttrs,triggerRef,open}` and must bind both to one focusable trigger; this advanced contract is documented and tested. Avoid nested buttons in option and tab slots. Use an actions sibling region where needed.

## 4. Scoped styling and customization

New visual components should be Vue SFCs with `<style scoped>`. Token declarations and optional application defaults remain global. Scoped CSS is selector isolation, not Shadow DOM: custom properties inherit, parent styles can affect a child root, and consumer content in slots is owned by the consumer. Use `:slotted()` only for a documented direct slot-child rule; do not depend on it to style nested consumer trees. See [Vue SFC CSS features](https://vuejs.org/api/sfc-css-features.html).

Customization order: provider defaults → explicit props → named slots → semantic tokens/component custom properties → `class/style` and typed `ui` parts → `unstyled` plus app skin. Internal DOM and generated scope IDs are private; apps should not need `:deep()` to perform supported customization.

Component hooks use `--aven-<component>-<role>`: button `bg`, `fg`, `border`, `radius`, `padding-inline`, `min-height`, `gap`; input `bg`, `fg`, `placeholder`, `border`, `focus-ring`; overlay `bg`, `border`, `shadow`, `max-width`, `max-height`; list `item-bg`, `item-selected-bg`, `item-hover-bg`. These are proposed additions, not existing tokens. Variables without overrides fall back to semantic and non-color tokens. Resolve default values at the property use site so inherited app overrides work:

```vue
<!-- Proposed AvenButton internal style pattern -->
<style scoped>
:where(.aven-button) {
  color: var(--aven-button-fg, var(--aven-color-accent-on-solid));
  background: var(--aven-button-bg, var(--aven-color-accent-solid));
  border-radius: var(--aven-button-radius, var(--aven-radius-md));
  padding-inline: var(--aven-button-padding-inline, var(--aven-space-4));
  min-block-size: var(--aven-button-min-height, 2.25rem);
}
:where(.aven-button:focus-visible) {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
</style>
```

Every interactive hook needs a state equivalent where appropriate (`bg-hover`, `bg-pressed`, `fg-disabled`, `border-invalid`). `unstyled` keeps focus support and interaction available; the consumer is responsible for a visible focus treatment in its replacement skin.

A proposed consumption example (not currently exported):

```vue
<AvenButton
  class="project-save"
  tone="accent"
  variant="soft"
  :loading="saving"
  :ui="{ label: { class: 'project-save-label' } }"
  @click="save"
>
  <template #leading><ProjectSaveIcon aria-hidden="true" /></template>
  Save changes
  <template #trailing><AvenKbd>Ctrl S</AvenKbd></template>
</AvenButton>

<style scoped>
.project-save {
  --aven-button-radius: var(--aven-radius-lg);
}
</style>
```

Keep AvenText's existing TS entry and CSS hooks compatible; converting it to SFC is a separate optional migration. Scoped component CSS must be extracted and included in documented package CSS entries. Preserve today's explicit CSS import policy; do not start injecting global styles from JavaScript without a release decision.

## 5. Themes and visual recipes

Use [the exact palette reference](component-theme-reference.md). Light is a slate/white system; dark uses neutral charcoal/gray surfaces with pastel semantic fills and dark on-solid text. Do not tint all dark surfaces blue or keep white text on dark-mode accent fills.

| Recipe                  | Base                                       | Hover / pressed                                       | Foreground and boundaries                                                       |
| ----------------------- | ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Solid action / badge    | `tone-solid`                               | `tone-hover` / `tone-pressed`                         | `tone-on-solid`; match foreground to fill                                       |
| Soft action / status    | `tone-subtle`                              | `tone-soft`; pressed also soft plus inset/outline cue | `tone-text`; optional `tone-border`                                             |
| Outline action          | `surface-base` or transparent              | `tone-subtle` / `tone-soft`                           | `tone-text`, `tone-border`                                                      |
| Ghost action            | transparent                                | `surface-hover` / `surface-pressed`                   | text-primary or tone-text                                                       |
| Link action             | transparent                                | underline + link-hover / link-pressed                 | link-default; visited only for real navigation                                  |
| Field                   | `surface-base`                             | border-interactive on hover                           | text-primary, text-placeholder, border-interactive; invalid uses border-invalid |
| Filled field            | `surface-recessed`                         | `surface-hover`                                       | Same label and error contract as outlined field                                 |
| Selected list row / tab | `surface-selected`                         | selected-hover / selected-pressed                     | text-primary plus selected marker and border-selected                           |
| Strong text selection   | `selection-fill`                           | n/a                                                   | `selection-text`; use together                                                  |
| Floating panel          | surface-popover/dropdown/context-menu      | row hover inside                                      | text-primary, border-default; ambient/contact shadows                           |
| Card / dialog / sidebar | matching surface-card/dialog/sidebar alias | component-specific                                    | text-primary, border-subtle; controls remain identifiable                       |
| Disabled control        | surface-disabled                           | no action response                                    | text-disabled, icon-disabled; no whole-control opacity multiplication           |
| Invalid field           | normal field background                    | retains focus styling                                 | danger-text message + border-invalid + error icon/text                          |
| Loading                 | preserve previous surface/content          | blocks duplicate action when specified                | aria-busy, spinner or skeleton; veil-loading only when needed                   |

The recipe table abbreviates `--aven-color-`. Tone tokens exist for the listed semantic families. Financial buy/sell/gain/loss roles are optional domain additions, not aliases for generic success/danger actions. Chart/category colors never become arbitrary action colors.

Use rounded rectangles by default, radius-md for controls and radius-lg for cards; pill is an explicit option for badges/chips/segmented controls. Proposed minimum control heights: xs 1.5rem, sm 1.875rem, md 2.25rem, lg 2.75rem; these are new design targets, not current tokens. Allow wrapping and height growth. Compact controls need adequate spacing or expanded hit regions for touch. Do not globally shrink typography with density.

New non-color tokens should cover control sizes, border width, focus width/offset, shadows, motion duration/easing, overlay layers, and layout breakpoints. Extend the current spacing scale only when a real component needs it. Font files are not currently bundled; apps choose whether to load Inter.

### Theme ownership and portals

Apps own persistence and initial preference; the package must not read localStorage on import. A proposed `AvenProvider` coordinates locale, direction, density, icon resolver, translations, and overlay root without becoming a required global singleton. Explicit component props beat provider defaults.

CSS inheritance follows physical DOM, including [Vue Teleport](https://vuejs.org/guide/built-ins/teleport.html). Vue provide/inject still follows the logical component tree, so it does not carry CSS variables into a body-level portal. Preferred overlay placement is a managed root inside the active theme/customization scope. If escaping clipping requires a body-level portal, copy resolved theme/contrast/direction and supported custom properties, update them while open, and clean up on unmount. Copying only `data-aven-theme` is insufficient for arbitrary subtree token overrides. Specify which strategy each overlay uses and test a dark app containing a light themed panel.

Respect existing `data-aven-contrast="more"`, `data-aven-output="print"`, forced-colors overrides, system preference changes, and reduced motion. Gradients are decorative and use existing solid fallbacks. Custom color overrides require contrast verification in both themes.

## 6. Behavior shared by component families

### Fields and forms

`AvenField` owns visible label, optional required/optional indicator, description, and linked error. Generated IDs must be deterministic for SSR/hydration on the supported Vue range; do not require Vue 3.5-only `useId` while promising Vue 3.3 support. Expose `id` and a stable app-provided ID seed/factory fallback until that compatibility decision is made.

Inputs forward native name/form/required/min/max/pattern/autocomplete as appropriate. Custom selectors use hidden inputs for submission and restore default state on native form reset. Multi-value submission uses repeated names; booleans follow documented checked-value semantics. Disabled controls are omitted. `readonly` is a component behavior only where native HTML lacks it. Validation is app-owned; components display results and link descriptions/errors without choosing a schema library.

IME composition must not prematurely emit search/commit/Enter actions. Support `.trim`, `.number`, `.lazy` only when explicitly declared; do not silently transform free text or money. Async search is controlled through query/update events plus app-supplied loading/results/error. Apps cancel stale requests; components retain active option by stable key when possible.

### Overlay and focus infrastructure

Share placement, collision flip/shift, scroll/resize tracking, outside-pointer detection, focus restoration, and nested overlay stacks. Expose `placement`, `offset`, `collisionPadding`, `matchTriggerWidth`, `teleportTo`, and `strategy` only on applicable overlays. Body scroll lock is reference-counted. Topmost Escape closes one layer; closing a nested menu must not close its dialog. Restore focus only if the opener still exists and is usable. Modal dialogs trap focus and make background content inert; nonmodal popovers do neither by default. Placement/focus/scroll listeners clean up on close and unmount.

### Keyboard and accessibility

Follow [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) for the chosen semantic widget. Use native HTML first. Buttons activate with Enter/Space; links with Enter; radios and tabs use arrow navigation; menu/listbox use their appropriate item navigation and typeahead. Do not install global shortcuts on package import. Commands are registered by apps and respect focused editing controls.

Target WCAG 2.2 AA: test actual rendered pairings for text contrast, control boundaries, visible focus, labels, and target size. APG is interaction guidance, not proof of compliance. Long text, RTL, 200% zoom, narrow windows, keyboard-only use and a screen reader need explicit checks. Status cannot rely on color alone. Tooltips never carry the only label or essential error. Slots must preserve accessible names and required semantics.

## 7. Implementation slices and dependencies

| Phase | Deliverable                                                                                          | Exit evidence                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 0     | Shared types, provider, field/ID contract, component CSS packaging, demo conventions                 | Import contract approved; both theme previews; no AvenText regressions                  |
| 1     | Icon, Button/IconButton/ButtonGroup, Link, Badge, Text, Field, Input/Textarea, Checkbox/Radio/Switch | Native form submit/reset, keyboard, invalid/disabled/loading states, slot customization |
| 2     | Overlay infrastructure, Tooltip, Popover, Dialog/Drawer, Menu/Dropdown/ContextMenu, Select/Combobox  | Nested overlay focus, Escape, collision handling, themed portals and async choices      |
| 3     | Tabs, SegmentedControl, Breadcrumb, Pagination, NavList/Sidebar, Toolbar, Card/Panel, Accordion      | Controlled/uncontrolled parity, RTL, responsive navigation                              |
| 4     | Table and list composition, search/filter controls, tree, virtualization, dates/numbers/files        | Stable key behavior, large list navigation, locale/timezone and upload boundaries       |
| 5     | Optional chart, timeline, board, rich-editor integration packages                                    | Dependency budgets measured; app adapters demonstrate reuse                             |

Within a phase build dependencies first: Button → trigger; Field + Input + Popover + Listbox → Combobox; Menu primitives + overlay → Dropdown/ContextMenu; table primitives + checkbox/sort/filter/pagination → DataTable. A data grid is an additional keyboard model and should not be advertised by a basic HTML table.

Do not add a headless, floating, date, icon, chart or validation dependency until its maintenance, license, size and Vue compatibility are reviewed. Reuse a proven accessibility/placement primitive where appropriate, but keep Aven public types independent from vendor types.

## 8. Release and verification contract

Each component needs documented typed props/defaults, emitted payloads/timing, scoped slots, part hooks, ref methods, accessibility behavior, theme states, and a real customization example. A playground should allow light/dark/system, nested theme, contrast, density, RTL, loading, invalid, empty, long text, and slot overrides. Build a small settings form and searchable list to prove components compose.

Use focused behavior tests for state changes, keyboard actions, forms and events. Test controlled/uncontrolled values, native reset, async option refresh, click emitted once, IME, disabled suppression, and ref methods. Browser checks cover focus, popup collision, theme inheritance, and visual state coverage; SSR rendering/type checks alone cannot prove them.

For implementation work use existing commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run build:playground`, `npm run colors:check`, and `npm run pack:check`. Inspect packed exports/declarations/CSS and test a consumer install when publishing components. Optional color-browser checks are relevant if token behavior changes. This research-only change does not require running product builds.

Preserve explicit CSS imports, sideEffects CSS metadata, named tree-shakeable exports, and per-component entry points consistent with AvenText. Docs added here are repository documentation; the current package `files` list does not include these new files automatically. Include them intentionally later if npm consumers should receive them. No publishing, dependency changes, or component implementation is performed by this research task.

## 9. Decisions before the first component release

Recommended defaults: SFC scoped CSS for new components; explicit stylesheet entry; public `ui` part map plus CSS variables; stable primitive value keys; native Select separate from Combobox; app-owned routing/data/storage. Confirm the public API in phase 0 examples before committing to compatibility guarantees.

Remaining implementation decisions: supported browser/Tauri versions; whether Vue 3.3 remains the peer minimum; a headless/placement dependency choice; exact icon adapter; date-only/timezone type helper; bundle-size budgets; stable generated-ID strategy. These do not block this specification. Resolve each before shipping the component that depends on it.

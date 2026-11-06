# Detailed common component catalog

Future Vue components described here belong in `packages/vue` (`@wellsaik/aven-vue`); shared tokens and themes remain in `packages/shared`. The catalog is a plan, not an implementation.

Proposed API, 2026-11-05. Only AvenText currently exists. All other names, props, events, slots and hooks below are planned. See [shared contracts](component-library-plan.md) before implementing individual entries and [research](app-component-research.md) for the 16-app evidence.

## How to read the contracts

Every entry inherits applicable native attributes, `class/style`, `ui` part overrides and `unstyled` from the shared contract. Fields inherit disabled/readonly/invalid/name/form and the Field label/error linkage; actionable components inherit disabled/loading and native focus events where meaningful. Entries list category-specific additions rather than repeating all native attributes.

`Value = string|number`, `Key = string|number`; use a generic type parameter to preserve a consumer's narrower value union. An `Option<T>` has `{value:T,label:string,disabled?:boolean,description?:string,group?:Key,keywords?:string[]}`. Icons and extra metadata are app-provided typed extensions. A `Command` has `{key,label,disabled?,tone?,shortcut?,children?}`. Boolean and object selection types are specified individually. Do not compare selected objects by label or object reference.

Event notation `update:x(T)` means the exact next-state payload; `change(T)` means a committed user edit. Object event payloads are shown with named fields. `select` and `remove` include optional `originalEvent` as specified in the shared contract. Unlisted semantic events do not exist. DOM listeners still apply to their documented targets.

Slot notation `item{item,key,...}` means a scoped named slot. A slot without braces has no required scope. In list slots `active` is keyboard focus, and `selected` is value selection; these must not be conflated. `label`, `description`, and `error` come from AvenField when a field composes it.

**Priority:** P0 foundations/first usable forms; P1 navigation and overlays; P2 data and specialized fields; P3 optional advanced integrations. Each numbered entry is a component or closely related compound family, not an assertion that every part needs its own npm entry.

## Actions and visual primitives

### 01. AvenText — P0, existing

- **Styles:** existing title/header1/header2/header3/text/quote/caption; preserve typography defaults, semantic element override, theme-aware text hooks. Future additions may include weight, alignment, wrapping and truncation without changing heading meaning.
- **Props:** current `type: AvenTextType='text'`, `as?: keyof HTMLElementTagNameMap`. Proposed `align?:'start'|'center'|'end'`, `truncate?:boolean`, `lineClamp?:number`, `tone?:Tone`; these are additions requiring implementation, not current support.
- **Events:** no custom events; normal listeners fall through to the rendered root.
- **Slots:** `default`; future `leading/trailing` only if useful composition is demonstrated, rather than turning text into layout chrome.
- **Hooks/behavior:** existing `--aven-text-color/font-family/font-size/font-weight/line-height`; allow text wrapping and copy/select. Truncation must not hide the only available full text.

### 02. AvenIcon — P0

- **Styles:** monochrome currentColor, semantic tone, xs/sm/md/lg/custom size, optional spin; decorative default.
- **Props:** `name?:string`, `size?:Size|number`, `strokeWidth?:number`, `decorative=true`, `label?:string`, `spin=false`; use app/provider icon resolver or trusted SVG slot rather than a bundled giant icon registry.
- **Events:** none custom. Put clickable icons inside IconButton rather than giving SVG button semantics.
- **Slots:** `default` for SVG paths/content; accessible title supplied through `label` when meaningful.
- **Hooks/behavior:** `--aven-icon-size/color/stroke-width`; hide decorative icons from assistive tech, require label when meaningful, respect reduced motion. Never inject untrusted SVG strings.

### 03. AvenButton — P0

- **Styles:** solid, soft, outline, ghost, link; tone palette; xs/sm/md/lg; rounded/pill/square; full-width; icon-leading/trailing; loading label preserved.
- **Props:** `variant='solid'`, `tone='accent'`, `size='md'`, `type:'button'|'submit'|'reset'='button'`, `disabled=false`, `loading=false`, `loadingBehavior:'block'|'allow'='block'`, `block=false`, `shape:'rounded'|'pill'|'square'='rounded'`; native form/formaction attributes.
- **Events:** `click(MouseEvent)` once per native activation; focus/blur. Loading-blocked/disabled buttons suppress action. Native form submit/reset semantics remain intact.
- **Slots:** `default`, `leading{disabled,loading}`, `trailing{disabled,loading}`, `loading{loading}`; `ui` parts root/label/leading/trailing/spinner.
- **Hooks/behavior:** button bg/fg/border and hover/pressed/disabled equivalents, radius/gap/padding/min-height; native button; Enter/Space; `aria-busy`; accessible name persists while busy.

### 04. AvenIconButton — P0

- **Styles:** button variants and tones, square or circle; optional pressed indicator; badge is composed outside the hit target.
- **Props:** Button props except block, plus required `label:string`, `shape:'square'|'circle'='square'`, optional `tooltip:string`. Use ToggleButton for a modeled toggle.
- **Events:** Button click/focus/blur contract.
- **Slots:** `icon`, `loading`; `default` may provide icon content, never substitute for the required accessible label.
- **Hooks/behavior:** button hooks plus icon-size; tooltip supplements the label. Visible hit target need not shrink with icon glyph.

### 05. AvenButtonGroup / AvenSplitButton — P1

- **Styles:** attached or spaced, horizontal/vertical, shared size; split action plus independently disabled menu trigger.
- **Props:** group `orientation='horizontal'`, `attached=false`, `label?:string`; split `items:Command[]`, `primaryDisabled=false`, `menuDisabled=false`, `open?`, `defaultOpen=false`, normal button appearance props.
- **Events:** group none custom; split `click(MouseEvent)` for primary only, `select({key,item,originalEvent})`, `update:open(boolean)`, overlay events. Opening its menu must not run the primary action.
- **Slots:** group `default`; split `default`, `leading`, `trigger{triggerAttrs,triggerRef,open}`, `item{item,key,active,disabled}`, `menu-header`, `menu-footer`.
- **Hooks/behavior:** gap, joined-radius, separator; grouping alone does not impose toolbar arrow navigation. Split menu uses DropdownMenu semantics.

### 06. AvenLink — P0

- **Styles:** default/subtle/standalone; underline always/hover; tone; optional external icon.
- **Props:** `href:string`, `target?`, `rel?`, `download?`, `underline:'always'|'hover'|'none'='hover'`, `external=false`; optional router adapter scoped contract, no required router package.
- **Events:** native `click(MouseEvent)` including modifier information; do not intercept modified navigation by default.
- **Slots:** `default`, `leading`, `trailing`, optional adapter `link{linkAttrs}`.
- **Hooks/behavior:** link default/hover/pressed/visited tokens; secure rel defaults for new-window targets with explicit override policy. No fake disabled anchor; use clear unavailable text when navigation is unavailable.

### 07. AvenToggleButton / AvenToggleGroup — P1

- **Styles:** outline/soft/ghost with pressed cue, icon-only or label; attached or spaced group.
- **Props:** button `modelValue:boolean`, `defaultValue=false`, `label` for icon-only; group `modelValue:Value|null|Value[]`, `multiple=false`, `allowEmpty=true`, `items`, `orientation='horizontal'`, size/tone.
- **Events:** update:modelValue and change on activation; group sends full next selection. Arrow key focus is distinct from changing a multiple selection.
- **Slots:** button default/leading/trailing; group `item{item,key,selected,active,disabled}`.
- **Hooks/behavior:** selected-bg/fg/border, gap; `aria-pressed` for independent buttons. Use RadioGroup/SegmentedControl for exclusive value choices requiring radio semantics.

### 08. AvenBadge / AvenStatusDot — P0

- **Styles:** solid/soft/outline/dot, tone palette, rounded/pill, dot with label, count with overflow.
- **Props:** `tone='neutral'`, `variant='soft'`, `size:'xs'|'sm'|'md'='sm'`, `count?:number`, `max=99`, `showZero=false`, `label?:string`.
- **Events:** none custom; actionable badges are buttons/chips instead.
- **Slots:** `default`, `leading`, `trailing`.
- **Hooks/behavior:** badge bg/fg/border/radius/dot-size; label expands count accessibly (e.g. visible 99+, accessible 147 notifications); status is never dot color alone.

### 09. AvenChip / AvenTag — P1

- **Styles:** soft/outline/solid; removable, selected, compact, avatar/icon leading.
- **Props:** `value?:Value`, `selected?:boolean`, `removable=false`, `disabled=false`, `removeLabel:string` when removable; size/tone.
- **Events:** `click(MouseEvent)` only for configured action mode; `remove({value,originalEvent})` requests removal, app updates data.
- **Slots:** `default`, `leading`, `trailing`, `remove-icon`; removal button remains library-owned.
- **Hooks/behavior:** chip bg/fg/border/gap/remove-hit-size; do not nest its removal button inside another button. Noninteractive tag renders plain content.

### 10. AvenAvatar / AvenAvatarGroup — P1

- **Styles:** circle/rounded/square; image/initials/icon; size scale; bordered stack and overflow counter.
- **Props:** `src?`, `alt?`, `name?`, `initials?`, `size='md'`, `shape='circle'`, `loading:'lazy'|'eager'='lazy'`; group `max?:number`, `items`, `overlap?:number`.
- **Events:** `load(Event)`, `error(Event)` from image; group `overflowClick({hiddenItems,originalEvent})` only if overflow action is supplied.
- **Slots:** `fallback{name,initials}`, `status`, group `avatar{item,index}`, `overflow{hiddenItems,count}`.
- **Hooks/behavior:** size/radius/bg/fg/border/overlap; deterministic initials, image-error fallback; empty alt when adjacent visible name duplicates it.

### 11. AvenKbd / AvenSeparator — P0

- **Styles:** Kbd subtle keycap/outline, size; separator horizontal/vertical, inset, labeled.
- **Props:** Kbd `keys?:string[]`, `platform?:'auto'|'mac'|'windows'|'linux'`; separator `orientation='horizontal'`, `decorative=true`, `inset?:string`.
- **Events:** none custom.
- **Slots:** both `default`; separator optional `label`.
- **Hooks/behavior:** kbd bg/border/font, separator color/thickness/gap. Key hint text never registers a shortcut; decorative separator is hidden from assistive tech.

## Form fields and value controls

### 12. AvenField / AvenFieldset — P0

- **Styles:** stacked, inline, floating-label only when robust; required/optional, valid/invalid, compact; fieldset grouped with legend.
- **Props:** `id?`, `label?:string`, `description?:string`, `error?:string|string[]`, `required=false`, `optional=false`, `invalid=false`, `orientation='vertical'`, `labelWidth?:string`; Fieldset disabled/legend and native fieldset attributes.
- **Events:** no validation engine events; `focusin/out(FocusEvent)` may fall through on group.
- **Slots:** `label{required,invalid}`, `description`, `error{messages}`, `default{controlId,descriptionId,errorId,invalid,controlAttrs}`, `before`, `after`, `actions`.
- **Hooks/behavior:** label-color/error-color/gap/label-width; renders label-for or proper group legend; only existing message IDs enter aria-describedby. Do not duplicate wrapping Field inside already composed field controls.

### 13. AvenInput / AvenSearchField / AvenPasswordField — P0

- **Styles:** outline/filled/underline, size, rounded/pill, prefix/suffix, icon adornments, clearable; search leading icon; password reveal.
- **Props:** `modelValue:string`, `defaultValue=''`, `type:'text'|'email'|'url'|'tel'|'search'|'password'='text'`, `placeholder?`, `clearable=false`, `clearLabel`, native autocomplete/inputmode/minlength/maxlength/pattern; search `debounce=0`; password `revealable=true`, reveal/hide labels.
- **Events:** update:modelValue(string) on accepted input, `change(string)` on native change; `clear({previousValue,originalEvent})`, `focus/blur`; search `search({query})` after optional debounce and `submit({query,originalEvent})` on uncomposed Enter. Password `update:revealed(boolean)` if externally controlled.
- **Slots:** leading/trailing, prefix/suffix, clear-icon, password reveal-icon{revealed}, and Field label/description/error. Adornment actions are independent buttons with type=button.
- **Hooks/behavior:** input bg/fg/placeholder/border/focus-ring/padding/gap; expose focus/blur/select. Clear emits one update and restores control focus; IME-safe search. Native `type=number` belongs to NumberInput with an explicit numeric model.

### 14. AvenTextarea — P0

- **Styles:** outline/filled, resize vertical/none/both, autosize, count; invalid and readonly.
- **Props:** `modelValue:string`, `defaultValue=''`, `rows=3`, `minRows?:number`, `maxRows?:number`, `autosize=false`, `resize='vertical'`, `maxlength?`, `showCount=false`, `placeholder?`, native wrap.
- **Events:** update:modelValue(string), change(string) on native change, focus/blur; `resize({height})` only when autosize measurement changes.
- **Slots:** leading/trailing, footer{length,maxlength}, count{length,maxlength}, Field slots.
- **Hooks/behavior:** textarea min-height/max-height/padding; preserve newlines and selection. Growth must not move focused content offscreen unexpectedly.

### 15. AvenNumberInput — P2

- **Styles:** outlined/filled, inline or end-aligned steppers, tabular figures, unit prefix/suffix.
- **Props:** `modelValue:number|null`, `defaultValue=null`, `min?`, `max?`, `step=1`, `precision?`, `locale?`, `formatOptions?:Intl.NumberFormatOptions`, `controls=true`, `clampOnCommit=true`, `allowEmpty=true`.
- **Events:** update:modelValue(number|null) for parseable accepted values; `update:inputValue(string)` exposes draft text; `change(number|null)` on commit; `invalidInput({text,reason})`; `step({direction,value,originalEvent})`.
- **Slots:** prefix/suffix, increment-icon/decrement-icon, Field slots.
- **Hooks/behavior:** input hooks plus stepper-size; preserve intermediate `-`/decimal drafts, avoid emitting NaN, define rounding and locale parsing. Currency requiring exact decimal precision needs an optional string/decimal adapter; generic number input must not claim exact accounting arithmetic.

### 16. AvenCheckbox / AvenCheckboxGroup — P0

- **Styles:** square/rounded, solid/outline; checkbox with title/description; optional card choice; checked/unchecked/indeterminate.
- **Props:** single `modelValue:boolean`, `defaultValue=false`, `indeterminate=false`, `value?:string`, native name/required; group `modelValue:Value[]`, `items:Option[]`, `min?:number`, `max?:number`, `orientation='vertical'`.
- **Events:** update:modelValue and change once per user toggle; group `limit({kind:'min'|'max',value})` if proposed change is blocked.
- **Slots:** label/description, `indicator{checked,indeterminate,disabled}`, group `item{item,key,selected,disabled}` and group label/error.
- **Hooks/behavior:** indicator-size/bg/check-color/border/gap; native checkbox and indeterminate DOM property, Space activation; partial visual state is not a third submitted value. Group min/max rules link error/help text.

### 17. AvenRadio / AvenRadioGroup — P0

- **Styles:** circle, outline/solid, card choices, inline/stacked, selected indicator.
- **Props:** group `modelValue:Value|null`, `defaultValue=null`, `items:Option[]`, `name?`, `required=false`, `orientation='vertical'`; radio `value:Value`, disabled, label.
- **Events:** group update:modelValue(Value) and change(Value) when choice changes; no event when choosing the already selected value.
- **Slots:** item{item,key,selected,active,disabled}, label/description, indicator{checked}, group error.
- **Hooks/behavior:** radio size/dot-size/selected-bg/border/gap; one group name, native keyboard behavior, Arrow movement and Space; no nested checkbox or button inside choice label.

### 18. AvenSwitch — P0

- **Styles:** pill track, small/medium/large, label before/after, optional state text/icons.
- **Props:** `modelValue:boolean`, `defaultValue=false`, `label:string`, `labelPosition:'start'|'end'='end'`, `name?`, `checkedValue='on'`, disabled/readonly/loading.
- **Events:** update:modelValue(boolean), change(boolean) on user toggle; app owns async commit and rollback.
- **Slots:** label/description, thumb{checked}, checked-icon/unchecked-icon, checked-label/unchecked-label.
- **Hooks/behavior:** track-on/off, thumb-color, width/height; native checkbox with switch role or correctly modeled switch, Space activation. The accessible label stays stable when value changes.

### 19. AvenSelect — P1

- **Styles:** native browser control with outline/filled shell, sizes, leading adornment; platform option styling may vary.
- **Props:** `modelValue:Value|null`, `defaultValue=null`, `options:Option[]`, `placeholder?:string`, `name?`, native required/autofocus; optgroup via group definitions. Initial version single selection; multiple belongs to Listbox/Combobox.
- **Events:** update:modelValue(Value|null), change(Value|null) on native selection, focus/blur.
- **Slots:** leading/trailing and Field slots; no rich arbitrary option slot inside native option. Use label strings for native options.
- **Hooks/behavior:** input hooks plus chevron-color; typed mapping from native string values back to stable keys. Keep native keyboard, mobile picker, reset and submission behavior.

### 20. AvenListbox — P1

- **Styles:** bordered/flat, compact/comfortable, selected checkmark, option descriptions, grouped sections, single/multiple.
- **Props:** `modelValue:Value|null|Value[]`, `defaultValue`, `multiple=false`, `options:Option[]`, `orientation='vertical'`, `selectionBehavior:'toggle'|'replace'`, `loop=false`, `virtual=false`.
- **Events:** update:modelValue, change on selection; `highlight({value,index,originalEvent})`; `endReached({lastKey})` for app pagination.
- **Slots:** item{item,key,index,selected,active,disabled}, group{group}, indicator{selected}, empty, header/footer, separator.
- **Hooks/behavior:** item-hover/selected-bg, padding/gap; listbox/option semantics, arrows/Home/End/typeahead, clear separation of active and selected. Virtual options need valid active-descendant IDs and visible active rows.

### 21. AvenCombobox / AvenMultiSelect — P1

- **Styles:** searchable field with popup, rich options, selected chips, single/multiple, clearable, async loading/error/empty.
- **Props:** `modelValue:Value|null|Value[]`, `multiple=false`, `options:Option[]`, `query?:string`, `defaultQuery=''`, `filter?: (option,query)=>boolean`, `remote=false`, `loading=false`, `error?:string`, `clearable=false`, `creatable=false`, `maxSelected?:number`, popup placement/width props. `remote` disables local filtering; no built-in fetch.
- **Events:** update:modelValue, change on selection/removal; `update:query(string)`, `create({query,originalEvent})` request only; `clear({previousValue})`, `remove({value,originalEvent})`, update:open and overlay events; `loadMore({query,lastKey})`.
- **Slots:** selected{items}, chip{item,remove,disabled}, option{item,key,index,selected,active,disabled}, group, leading/trailing, empty{query}, loading, error{error}, create{query}, popup-header/footer, Field slots.
- **Hooks/behavior:** input/chip/listbox/overlay hooks; combobox expanded/controls/autocomplete semantics, active-descendant, Escape and Enter, IME safety. Creating never silently inserts unvalidated objects. Maintain labels for values whose option data has not loaded yet.

### 22. AvenSlider / AvenRangeSlider — P2

- **Styles:** horizontal/vertical, solid track, marks, labeled ticks, optional value bubble; two-thumb range.
- **Props:** modelValue number or `[number,number]`, min=0/max=100/step=1, `orientation='horizontal'`, `marks?:{value,label?}[]`, `minGap=0`, `formatValue?`, `label` or per-thumb labels, `inverted=false`.
- **Events:** update:modelValue during key/drag changes, change at pointer release or key commitment, `dragStart({thumb,value})`, `dragEnd({thumb,value})`.
- **Slots:** thumb{index,value,active}, mark{value,label}, value{value,index}, leading/trailing.
- **Hooks/behavior:** track/filled-track/thumb-size/tick-color; arrows/PageUp/PageDown/Home/End, proper min/max/value text per thumb, pointer capture/cancel handling and RTL direction. Thumbs cannot cross unless explicitly designed later.

### 23. AvenDatePicker / AvenDateRangePicker / AvenTimePicker — P2

- **Styles:** input + popover calendar, inline calendar, range band, presets, time columns; outline/filled.
- **Props:** date model `YYYY-MM-DD|null`; range `{start:DateOnly|null,end:DateOnly|null}`; time `HH:mm[:ss]|null`; min/max, `disabledDate?`, `locale`, `weekStartsOn?:0|1|2|3|4|5|6`, `months=1`, `presets`, `clearable=false`, `timeStep=15`, `hourCycle?:'h12'|'h23'`, `open?`. Date-only values never implicitly convert through UTC Date serialization.
- **Events:** update:modelValue when valid selection changes; change on complete date/range/time commit; `update:open`, `monthChange({year,month})`, `invalidInput({text,reason})`, `presetSelect({key,value})`.
- **Slots:** day{date,selected,today,disabled,inRange}, month-header, weekday{label,index}, preset{item}, time-option, footer{apply,clear}, Field slots.
- **Hooks/behavior:** day-size/selected/today/range-bg; calendar grid keyboard and month/year navigation, accessible format help, locale labels. Scheduling/timezones/DST need an explicit adapter; a date field does not own event scheduling.

### 24. AvenFileInput / AvenDropzone — P2

- **Styles:** inline browse, dashed drop surface, file list, previews, per-file progress/error.
- **Props:** `modelValue:File[]`, `accept?:string`, `multiple=false`, `maxFiles?`, `maxSize?`, `disabled=false`, `loading=false`, `files?:UploadItem[]` for app upload metadata. UploadItem has stable key, name, size, progress, status and optional error.
- **Events:** update:modelValue(File[]), `select({files,originalEvent})`, `reject({files,reasons})`, `remove({key})`, `retry({key})`, `cancel({key})`, drag state events only if app needs them.
- **Slots:** default{dragging,open,disabled}, file{file,remove,retry,cancel}, progress{file,progress}, empty, error, actions.
- **Hooks/behavior:** drop-bg/active-border/file-row-gap; native browse keyboard fallback. Client accept/size checks are UX only; app/server validates. No upload endpoint or automatic network request; revoke generated object URLs on replacement/unmount.

### 25. AvenColorPicker — P2

- **Styles:** swatches, native picker, optional advanced palette popover; selected outline and textual code.
- **Props:** `modelValue:string|null`, `format:'hex'|'hexa'='hex'`, `swatches:{key,label,value}[]`, `alpha=false`, `clearable=false`, `open?`, `allowCustom=true`.
- **Events:** update:modelValue(string|null) during editing, change on commit; `invalidInput({text})`, update:open.
- **Slots:** trigger{triggerAttrs,triggerRef,value,open}, swatch{item,selected}, value{value}, footer, Field slots.
- **Hooks/behavior:** swatch-size/radius/selected-border; every swatch has a text name, transparency has a checkerboard plus text, native picker behavior documented. Custom colors do not automatically become accessible semantic tones.

### 26. AvenForm / AvenFormActions — P1

- **Styles:** vertical/grid/inline layout, responsive columns, sticky or inline actions, summary errors.
- **Props:** native action/method/novalidate; `disabled=false`, `loading=false`, `errors?:{controlId,message}[]`, `columns=1`, `gap`; actions `align='end'`, `sticky=false`.
- **Events:** `submit(SubmitEvent)` and `reset(Event)` with native preventDefault available; app owns validation and persistence. Do not invent a successful-save event without app confirmation.
- **Slots:** default{disabled,loading}, error-summary{errors}, header/footer; FormActions default/secondary.
- **Hooks/behavior:** column-gap/row-gap/actions-bg; use real form, submitter semantics and error-summary links. No implicit schema library; disabled fieldset propagation where appropriate.

## Menus, overlays and feedback

### 27. AvenMenu / AvenMenuItem / AvenMenuGroup — P1

- **Styles:** flat/bordered popup content, compact/comfortable, icons/descriptions/shortcuts, destructive item, separator, nested submenu.
- **Props:** items Command[], loop=false, orientation='vertical', typeahead=true; item kind action/checkbox/radio/submenu, `checked?:boolean`, `value?:Value`; group label, radio group key. For navigation collections use NavList.
- **Events:** `select({key,item,originalEvent})`, `update:checked({key,checked})`, `update:value({group,value})`, `highlight({key})`, `submenuChange({key,open})`.
- **Slots:** item{item,key,active,disabled,checked}, leading/trailing, shortcut{item}, group-label{group}, submenu-trigger, empty, header/footer.
- **Hooks/behavior:** menu bg/border/item-hover/item-checked/padding/min-width; menuitem/checkbox/radio semantics, arrows/Home/End/typeahead, submenu open/close direction respects RTL. App owns command execution and checked data.

### 28. AvenDropdownMenu — P1

- **Styles:** Menu recipes; icon-only, button or custom trigger; placement/collision options.
- **Props:** items Command[], open/defaultOpen, placement='bottom-start', offset=4, closeOnSelect=true, disabled=false, matchTriggerWidth=false, teleportTo?.
- **Events:** Menu selection events plus update:open, openChange, beforeClose, afterOpen/afterClose.
- **Slots:** trigger{triggerAttrs,triggerRef,open}, item scopes and menu regions, trigger-leading/trailing.
- **Hooks/behavior:** overlay/menu/button hooks; Enter/Space/ArrowDown opens with correct focus, Escape returns focus, outside press closes. It executes commands; it does not serve as a form select.

### 29. AvenContextMenu / AvenMenubar — P1

- **Styles:** shared Menu skin; anchored context panel; horizontal menubar with active trigger.
- **Props:** context items/open, disabled, `activation:'contextmenu'|'both'='contextmenu'`; menubar items, loop=true, label, density; overlay placement options.
- **Events:** select and menu state events; context `openChange({open,reason,point?})`; menubar `update:activeKey(Key|null)`.
- **Slots:** context default{openAt}, item/group scopes; menubar trigger{item,open,triggerAttrs,triggerRef}, item and submenu regions.
- **Hooks/behavior:** shared menu hooks; support Shift+F10/context-menu key and a visible alternate action for touch. Menubar has its own arrow navigation; do not replace ordinary website navigation with menubar roles.

### 30. AvenPopover — P1

- **Styles:** floating card, arrow optional, constrained scrollable content, size presets.
- **Props:** open/defaultOpen, placement='bottom', offset=8, showArrow=false, dismissible=true, initialFocus?:target, restoreFocus=true, teleportTo?, matchTriggerWidth=false; nonmodal by default.
- **Events:** shared overlay update/open/dismiss/transition events.
- **Slots:** trigger{triggerAttrs,triggerRef,open}, default{close}, header/footer, arrow.
- **Hooks/behavior:** popover bg/border/shadow/radius/max-width/max-height; arbitrary interactive content; no blanket role=menu. Give dialog semantics and a name when its content is a nonmodal dialog. Avoid trapping focus unless using Dialog.

### 31. AvenTooltip — P1

- **Styles:** neutral or inverse floating label, max-width wrapping, optional arrow; four sides.
- **Props:** text?, open/defaultOpen, openDelay=400, closeDelay=100, placement='top', disabled=false, showArrow=true.
- **Events:** update:open and openChange; no selection action.
- **Slots:** trigger{triggerAttrs,triggerRef,open}, default for noninteractive text.
- **Hooks/behavior:** tooltip bg/fg/shadow/max-width; role=tooltip and aria-describedby, appears on focus/hover and dismisses on Escape, hoverable as needed. Interactive controls go in Popover. Do not depend on hover for essential content.

### 32. AvenDialog / AvenAlertDialog — P1

- **Styles:** centered, small/medium/large/fullscreen, scrollable body, sticky actions, dangerous confirmation.
- **Props:** open/defaultOpen, title?, description?, size='md', closeOnEscape=true, closeOnOutside=true (alert dialog false), showClose=true, initialFocus?, restoreFocus=true, teleportTo?; AlertDialog requires a clear decision action.
- **Events:** shared overlay events; `confirm({originalEvent})`/`cancel({originalEvent})` on AlertDialog request app action. Confirm does not auto-close during app-owned saving unless configured explicitly.
- **Slots:** trigger, header{close}, title, description, default{close}, footer{close}, actions{confirm,cancel,loading}, close-icon.
- **Hooks/behavior:** dialog bg/border/radius/width/max-height/scrim; named dialog/alertdialog, modal focus trap, inert background, scroll lock, safe focus return. Alert dialogs favor the least destructive sensible initial action.

### 33. AvenDrawer / AvenSheet — P1

- **Styles:** start/end/top/bottom, modal or nonmodal inspector, fixed or resizable width, mobile full-width.
- **Props:** Dialog open/title/description/dismiss props, side='end', modal=true, size='24rem', resizable=false, minSize?, maxSize?.
- **Events:** overlay events, `update:size(string)`, `resizeStart/resizeEnd({size})` if resizable.
- **Slots:** header/title/default/footer/actions/close-icon, resize-handle{size}.
- **Hooks/behavior:** drawer size/bg/border/scrim; logical sides follow RTL. Modal uses Dialog behavior; nonmodal inspector keeps background available and does not lock scrolling globally.

### 34. AvenCommandPalette — P2

- **Styles:** centered search dialog, grouped result list, recent/pinned headings, shortcuts, async status.
- **Props:** open/defaultOpen, query/defaultQuery, items Command[], loading=false, filter?, emptyText, activeKey?, closeOnSelect=true, placeholder; no automatic global hotkey.
- **Events:** update:open, update:query(string), `select({key,item,originalEvent})`, `highlight({key})`, `loadMore({query})`, overlay events.
- **Slots:** input-leading/trailing, item{item,key,active,disabled}, group{group}, shortcut{item}, empty{query}, loading, footer.
- **Hooks/behavior:** dialog/input/listbox hooks; choose one documented search/combobox model within a modal, arrows/Enter/Escape, IME safety. App provides ranking, recent history and command execution.

### 35. AvenAlert / AvenBanner — P0

- **Styles:** soft/outline/solid, info/success/warning/danger/critical, inline or full-width banner, dismissible.
- **Props:** tone='info', title?, description?, dismissible=false, dismissLabel, `live:'off'|'polite'|'assertive'='off'`; app opts into live announcement for dynamically added content.
- **Events:** `dismiss({originalEvent})` request; no automatic deletion of app data.
- **Slots:** icon, title, default, actions, close-icon.
- **Hooks/behavior:** tone text/subtle/border; alert vs status role based on urgency, avoid repeated announcements during updates. Persistent instructions remain discoverable.

### 36. AvenToast / AvenToaster — P1

- **Styles:** compact raised notification, tone icon, optional action/progress, corner or center placement.
- **Props:** Toast `id:Key`, title?, description?, tone='neutral', duration=5000, closable=true, action?:{label,key}; Toaster `items:ToastItem[]`, position='bottom-end', maxVisible=3, gap, pauseOnHover=true, pauseOnFocus=true.
- **Events:** `dismiss({id,reason:'timeout'|'close'|'action'|'programmatic'})`, `action({id,key,originalEvent})`, afterClose; owner removes item.
- **Slots:** icon/title/default/action/close-icon; Toaster toast{item,dismiss}.
- **Hooks/behavior:** toast bg/border/shadow/width; polite status by default, urgent alert only when appropriate, no focus theft. Critical tasks need persistent feedback; respect reduced motion and pause timer during interaction.

### 37. AvenSpinner / AvenProgress / AvenSkeleton — P0

- **Styles:** spinner circle/dots, progress linear/circular, determinate/indeterminate, skeleton line/block/avatar, shimmer/pulse/static.
- **Props:** spinner size/label; progress value:number|null, min=0/max=100, label, showValue=false, formatValue?; skeleton width?/height?/lines=1/shape='rectangle'/animated=true.
- **Events:** none custom; app updates progress. Animation completion is not business completion.
- **Slots:** spinner default label, progress label/value{value,percent}, skeleton default optional placeholder layout.
- **Hooks/behavior:** track/fill/thickness/size/skeleton-bg; progressbar semantics only for real progress, hide decorative skeletons, one nearby busy/status message. Reduce motion to static/quiet behavior.

### 38. AvenEmptyState / AvenResultState — P0

- **Styles:** inline/contained/full-page, compact/large, empty/no-results/error/offline/success.
- **Props:** kind='empty', title:string, description?, tone?, loading=false; no built-in retry network request.
- **Events:** `retry({originalEvent})` when retry action is enabled; custom actions use slot buttons.
- **Slots:** illustration/icon, title, default, description, actions, footer.
- **Hooks/behavior:** content-max-width/gap/icon-color; no-results can offer clear filters, failed load offers retry without replacing known usable data. Distinguish loading from empty.

## Navigation, structure and layout

### 39. AvenTabs / AvenTab / AvenTabPanel — P1

- **Styles:** underline, pill, boxed, vertical, icon+badge, scrollable overflow, optional closable document tabs.
- **Props:** modelValue:Key, defaultValue?, items:{key,label,disabled?,closable?}[], orientation='horizontal', activation:'automatic'|'manual'='automatic', variant='underline', keepAlive=false, lazy=true, loop=true.
- **Events:** update:modelValue(Key), change(Key) on activation; `close({key,originalEvent})` requests owner removal; optional reorder({keys,from,to,originalEvent}) only with enabled reordering.
- **Slots:** tab{item,key,selected,active,disabled}, leading/trailing, badge{item}, panel{item,key,active}, close-icon, overflow.
- **Hooks/behavior:** indicator-color/thickness/tab-gap/selected-bg; tablist/tab/tabpanel linkage, arrows/Home/End, manual Enter/Space activation when configured. Route navigation uses NavList/Link unless it truly controls in-page panels. Define owner fallback when active tab is removed.

### 40. AvenSegmentedControl — P1

- **Styles:** filled track, outline, pill, equal-width or content-width, icon or label segments.
- **Props:** modelValue:Value|null, items:Option[], allowEmpty=false, block=false, orientation='horizontal', size='md', name?.
- **Events:** update:modelValue(Value), change(Value) on selection.
- **Slots:** item{item,key,selected,disabled}, leading/trailing.
- **Hooks/behavior:** track-bg/indicator-bg/radius/gap; radio group for exclusive value selection. A view switcher composes this; do not use it for unrelated actions or pretend it is a tablist without panels.

### 41. AvenBreadcrumb — P1

- **Styles:** text with chevron/slash, icons, collapsed middle items, size variants.
- **Props:** items:{key,label,href?,current?}[], maxVisible?, collapseFrom='middle', label='Breadcrumb'.
- **Events:** `navigate({key,item,originalEvent})` while preserving native link behavior; `expand({originalEvent})` on hidden segment expansion.
- **Slots:** item{item,index,current}, separator{index}, collapsed{items}, leading/trailing.
- **Hooks/behavior:** separator-color/gap/current-color; nav landmark with accessible label, aria-current=page on current item; expansion is keyboard reachable.

### 42. AvenPagination — P1

- **Styles:** numbered, compact previous/next, outlined/ghost, optional page-size select and range text.
- **Props:** modelValue:number=1, total:number, pageSize=20, pageSizeOptions=[10,20,50,100], siblingCount=1, boundaryCount=1, showSizeChanger=false, disabled/loading, labels?.
- **Events:** update:modelValue(number), change({page,pageSize}), update:pageSize(number). Changing page size proposes page 1; data fetching remains app-owned.
- **Slots:** page{page,current,disabled}, previous/next, ellipsis, summary{start,end,total}, page-size.
- **Hooks/behavior:** page-size/gap/selected-bg; nav with current page, disabled boundaries. Cursor pagination is a separate mode/component with hasNext/hasPrevious and no fabricated total/page numbers.

### 43. AvenNavList / AvenNavItem / AvenSidebar — P1

- **Styles:** flat/soft selected item, rail/icon-only/expanded, grouped sections, collapsible nested levels, badges, footer account area.
- **Props:** NavList items:{key,label,href?,children?,disabled?,badge?}[], activeKey?, expandedKeys:Key[], density; Sidebar collapsed?/defaultCollapsed=false, width='16rem', minWidth?, maxWidth?, collapsible=true, label?.
- **Events:** navigate({key,item,originalEvent}), update:expandedKeys(Key[]), update:collapsed(boolean), update:width(string) when resizable.
- **Slots:** brand/header/default/footer, item{item,key,active,expanded,depth}, item-leading/trailing, group-label, collapse-trigger.
- **Hooks/behavior:** surface-sidebar, item-selected/hover-bg, indent/width/gap. Use nav lists and disclosure buttons, not tree/menu roles by default. App owns route matching and persisted layout. Icon rail retains accessible labels and focus tooltips.

### 44. AvenSwitcher / AvenViewSwitcher — P1

- **Styles:** account/workspace dropdown with avatar; compact view toggle or menu overflow.
- **Props:** Switcher modelValue:Value|null, options:Option[], searchable=false, loading=false; ViewSwitcher modelValue:Value, items with label/icon, mode:'segments'|'menu'|'auto'='auto'.
- **Events:** update:modelValue, change on choice; `create({originalEvent})` and `manage({originalEvent})` only if those explicit actions exist.
- **Slots:** trigger{item,open,triggerAttrs,triggerRef}, option{item,selected,active}, leading/trailing, header/footer, view{item,selected}.
- **Hooks/behavior:** delegates to Select/Combobox/SegmentedControl according to actual value semantics. Never navigate or swap authentication contexts without app handling.

### 45. AvenToolbar / AvenActionBar — P1

- **Styles:** inline, raised, bordered, sticky, floating contextual; start/center/end groups and overflow.
- **Props:** orientation='horizontal', label:string, density, wrap=true, keyboardNavigation=false, selectionCount?:number; ActionBar shown when selection exists.
- **Events:** `overflowChange({keys})` only if adaptive overflow is enabled; `clearSelection({originalEvent})` for configured contextual bar.
- **Slots:** default, start/center/end, group, overflow{items}, selection{count}, actions.
- **Hooks/behavior:** surface-toolbar/padding/gap/border/shadow. Apply toolbar role/roving focus only when keyboardNavigation is enabled and documented. Overflow keeps all actions reachable at narrow widths.

### 46. AvenCard / AvenPanel / AvenPropertyRow — P0

- **Styles:** flat/outline/raised, padded/flush, header divider, footer actions; property label/value in stacked or aligned columns.
- **Props:** Card/Panel title?, description?, padding='md', variant='outline', as restricted content element; PropertyRow label:string, orientation='horizontal', labelWidth?, truncate=false, editable=false.
- **Events:** none for passive surfaces; PropertyRow `edit({originalEvent})` only when edit affordance configured. Whole-card navigation should compose a link without wrapping nested controls in it.
- **Slots:** header/title/description/default/footer/actions/leading/trailing; PropertyRow label/value/editor{finish,cancel}, help.
- **Hooks/behavior:** surface-card/panel, border/radius/padding/gap/label-width. Preserve heading order, wrapping, text selection; use definition lists for semantic property groups where appropriate.

### 47. AvenAccordion / AvenCollapsible — P1

- **Styles:** bordered sections, flush separators, card sections, chevron start/end, compact settings groups.
- **Props:** Accordion modelValue:Key|Key[]|null, multiple=false, collapsible=true, items with stable keys/disabled; Collapsible open/defaultOpen, disabled=false; lazy=true, unmountOnHide=false.
- **Events:** Accordion update:modelValue and change; Collapsible update:open and openChange; afterOpen/afterClose for expansion transition.
- **Slots:** trigger{item,open,disabled,triggerAttrs,triggerRef}, indicator{open}, content{item,open}, leading/trailing.
- **Hooks/behavior:** section-bg/border/trigger-padding/content-padding; button with aria-expanded/controls, no focus trapped in hidden content; reduce-motion safe height animation and content growth.

### 48. AvenStack / AvenInline / AvenGrid / AvenContainer — P0

- **Styles:** layout-only, responsive gap/alignment/wrapping and constrained readable widths.
- **Props:** gap token|string, align/start/center/end/stretch, justify, wrap=true for Inline, columns:number|responsive-map for Grid, minItemWidth?, maxWidth? for Container, as?:semantic content element.
- **Events:** none custom.
- **Slots:** default; no need for synthetic before/after slots because normal children compose freely.
- **Hooks/behavior:** gap/grid-min-width/container-max-width/padding; Grid/Flex logical layout, content-driven breakpoints, no fixed text heights. Do not add a JS window resize listener for layout CSS can express.

### 49. AvenAppShell / AvenSplitPane / AvenScrollArea — P1

- **Styles:** shell header/sidebar/main/inspector/statusbar; horizontal/vertical split; subtle scrollbars and dividers.
- **Props:** Shell sidebarCollapsed?, inspectorOpen?, headerSticky=true; SplitPane modelValue:number[] (percentages), minSizes/maxSizes, orientation='horizontal', collapsible=false, resizeStep=1; ScrollArea type:'auto'|'always'|'hover'='auto', orientation='both'.
- **Events:** shell update:sidebarCollapsed/update:inspectorOpen; split update:modelValue plus resizeStart/resizeEnd({sizes}); scroll `scroll(Event)` and `endReached({axis})` only when requested.
- **Slots:** shell header/sidebar/default/inspector/footer/statusbar; split pane{index}, handle{index,sizes}; scroll default/corner.
- **Hooks/behavior:** existing shell surface aliases, splitter-size/color, scrollbar-size; separator resize handles with keyboard arrows/Home/End and value semantics. No Tauri APIs or app window controls in core; prefer native scrolling and retain system scrollbar accessibility.

### 50. AvenStepper — P2

- **Styles:** horizontal/vertical steps, dots/numbers/icons, compact progress labels, connector line.
- **Props:** modelValue:Key, items:{key,label,description?,status?,disabled?}[], linear=true, orientation='horizontal', clickable=false.
- **Events:** update:modelValue(Key) when allowed; `requestStep({key,from,originalEvent})` allows app validation before externally controlled change; no implicit page submission.
- **Slots:** step{item,index,current,completed}, indicator{item,index}, label/description, connector{index}.
- **Hooks/behavior:** connector/active/completed/error colors; ordered list with current step, buttons only for clickable navigation. Completion needs icon/text beyond color.

## Collections, data and optional integrations

### 51. AvenList / AvenListItem / AvenVirtualList — P1/P2

- **Styles:** divided/flush/card rows, dense/spacious, leading avatars/icons, metadata and actions; optional virtualization.
- **Props:** items:T[], itemKey:(item)=>Key, loading=false, selectedKeys?:Key[], estimateSize=40 for VirtualList, overscan=5, orientation='vertical'; plain List does not select automatically.
- **Events:** `select({key,item,originalEvent})` only in explicit selectable mode; `endReached({lastKey})`, `rangeChange({start,end})` for virtual list, native scroll.
- **Slots:** item{item,key,index,selected}, leading/trailing, separator, header/footer, loading, empty, error.
- **Hooks/behavior:** row-bg/hover/divider/min-height/padding; expose scrollToKey/scrollToIndex; distinguish semantic list from Listbox. Virtualization handles dynamic measurement, key retention and keyboard focus; offer nonvirtual small-data mode.

### 52. AvenTable primitives / AvenDataTable — P2

- **Styles:** plain/bordered/striped, density, sticky header, numeric alignment, selected row, pinned columns, scroll shadow.
- **Props:** primitives compose native table/head/body/row/cell; DataTable rows:T[], columns:Column<T>[], rowKey, sort?:{key,direction}[], selectedKeys?:Key[], expandedKeys?:Key[], loading=false, rowCount?, stickyHeader=false, manualSort=false. Column includes key/header/accessor/align/width/minWidth/sortable/cell formatter. Virtual rows and editable grid are later opt-ins.
- **Events:** update:sort, update:selectedKeys, update:expandedKeys; `rowClick({row,key,originalEvent})`, `rowAction({row,key,action,originalEvent})`, `columnResize({key,width})`, `columnReorder({keys})` only when enabled. Sort events describe state; app/server sorting is explicit in manual mode.
- **Slots:** header{column,sort}, cell{row,rowKey,column,value,index}, row-leading/trailing, expanded{row,key}, caption, footer, toolbar{selectedKeys}, empty/loading/error, pagination.
- **Hooks/behavior:** surface-table-body/row-alternate, separators, selected/hover-bg, cell-padding; real table semantics with caption and aria-sort. Interactive cells must remain reachable; row click must not hijack inner buttons/links. Header checkbox announces partial selection. A grid keyboard model requires separate deliberate design.

### 53. AvenTree / AvenTreeItem — P2

- **Styles:** indented rows, connectors optional, folder/file icons, selected and partial-check states.
- **Props:** nodes:TreeNode[], nodeKey, childrenKey, selectedKeys, expandedKeys, checkedKeys?, multiple=false, checkable=false, loadingKeys:Key[], lazy=false, cascadeChecks=false.
- **Events:** update:selectedKeys/expandedKeys/checkedKeys, `loadChildren({key,node})`, `activate({key,node,originalEvent})`, `reorder({key,parentKey,index})` only with explicitly enabled tree drag behavior.
- **Slots:** item{node,key,level,expanded,selected,checked,indeterminate,loading}, toggle{expanded}, icon{node}, actions{node}, empty.
- **Hooks/behavior:** indent/connector/item-bg/selected-bg; tree/treeitem levels and expansion, arrows/Home/End/typeahead, focus retention when parents collapse. Lazy loading does not imply the component fetches data.

### 54. AvenSearchBar / AvenFilterBar / AvenFilterChip — P2

- **Styles:** inline search with chips, wrapping toolbar, expanded filter panel, compact summary and clear-all.
- **Props:** query:string='', filters:FilterValue[], definitions:FilterDefinition[], loading=false, resultCount?, showClearAll=true, debounce=0. Definition includes key/label/value type/operators/options; FilterValue includes stable id/field/operator/value.
- **Events:** update:query, update:filters; `search({query,filters})`, `remove({id})`, `clear({previousFilters})`, `apply({query,filters})`. Choose live or apply mode explicitly; no surprise auto-save.
- **Slots:** leading/trailing, filter{filter,definition,remove}, editor{definition,value,setValue}, add-trigger, summary{count}, empty.
- **Hooks/behavior:** input/chip/toolbar hooks; accessible remove labels identify the criterion. Search parsing, query serialization, saved views and data transport remain app-owned.

### 55. AvenFilterBuilder / AvenSortControl — P2

- **Styles:** nested condition groups, compact property/operator/value rows, popover editor; sort direction arrows and multi-sort list.
- **Props:** builder modelValue:FilterGroup, definitions, maxDepth=3, allowGroups=true; sort modelValue:{key,direction:'asc'|'desc'}[], fields, multiple=false. FilterGroup is typed `{id,operator:'and'|'or',children:(Condition|FilterGroup)[]}`.
- **Events:** update:modelValue, change on explicit apply; `add({parentId,condition})`, `remove({id})`, `reset({previousValue})`; SortControl emits update:modelValue on committed order/direction change.
- **Slots:** field/operator/value editors, condition{condition,update,remove}, group-header{group}, add-action, footer{apply,reset}; sort item{field,direction,index}.
- **Hooks/behavior:** group-indent/row-gap/border; preserve incomplete drafts without applying invalid queries. Validate operators against field types; library models intent without generating SQL or a service-specific query language.

### 56. AvenStat / AvenFormattedValue — P2

- **Styles:** label/value/unit/trend, compact inline or card, tabular numbers, positive/negative/missing/stale cues.
- **Props:** value:number|string|null, label?, format?:Intl.NumberFormatOptions, locale?, trend?:number, missingLabel='—', stale=false, unit?, tone?; exact-decimal strings require adapter formatting.
- **Events:** none custom; optional linked action composes Link/Button.
- **Slots:** label, value{value,formatted}, prefix/suffix, unit, trend{value,direction}, help.
- **Hooks/behavior:** number-default/emphasis/unit/missing/stale and optional finance tokens; distinguish missing from zero and excluded from negative. Keep signs/arrows/text for gain/loss; no baked-in buy/sell advice.

### 57. AvenTimeline / AvenActivityList — P3

- **Styles:** vertical activity rail, grouped dates, compact/detailed rows, tone icons and expandable details.
- **Props:** items:{key,timestamp,label,description?,status?}[], order='desc', locale?, timeZone?, loading=false, hasMore=false.
- **Events:** `loadMore({lastKey})`, `expand({key,expanded})`, `action({key,action,originalEvent})` only for configured actions.
- **Slots:** item{item,index}, indicator{item}, timestamp{item,formatted}, title/description, details, actions, empty/loading/footer.
- **Hooks/behavior:** line-color/indicator-size/gap; semantic ordered list/time element, absolute timestamp available alongside relative text, app handles refreshing live relative values and fetching records.

### 58. AvenBoard / AvenBoardColumn — P3 optional integration

- **Styles:** horizontal scroll columns, compact cards, count headers, empty drop surface, dragging indicator.
- **Props:** columns:{key,label,itemKeys}[], itemsByKey, disabled=false, draggable=false, loadingKeys=[], cardKey; app supplies allowed moves via canMove callback.
- **Events:** `moveRequest({itemKey,fromColumn,toColumn,fromIndex,toIndex,originalEvent})`, `select({key,item})`, `add({columnKey})`; app accepts/rejects and updates arrays.
- **Slots:** column-header/footer, card{item,key,index,column}, drag-preview{item}, empty-column{column}, add-card.
- **Hooks/behavior:** column-bg/width/gap/drop-indicator; keyboard-accessible Move action plus pointer drag. Business workflow transitions and persistence are outside the board. Consider separate entry/dependency for drag engine.

### 59. AvenChartFrame / AvenChartLegend / AvenChartTooltip — P3 optional integration

- **Styles:** chart surface, legend inline/wrapped/vertical, floating tooltip, categorical/sequential/diverging palette roles.
- **Props:** ChartFrame title?, description?, loading=false, error?, aspectRatio?; Legend items:{key,label,colorToken,hidden?}[], interactive=false; Tooltip items and coordinate/placement data supplied by chart adapter.
- **Events:** `toggleSeries({key,visible})`, `retry({originalEvent})`; chart-specific select/zoom events belong to the rendering adapter.
- **Slots:** default{theme}, title/description, legend{items}, tooltip{items}, empty/loading/error, accessible-table.
- **Hooks/behavior:** existing chart module colors and same theme scope for plot/legend/tooltip; provide textual summary/table, non-color distinctions and stable series assignment. Canvas adapters resolve computed tokens and redraw on theme changes. Core does not choose a chart engine.

### 60. AvenRichTextField / AvenCodeBlock — P3 optional integration

- **Styles:** document/plain editor chrome, formatting toolbar, placeholder, readonly preview; code monospace with optional header and copy action.
- **Props:** editor modelValue uses explicitly selected document schema, readonly/disabled/placeholder, extensions configured by app; CodeBlock code:string, language?, showLineNumbers=false, copyable=false, wrap=false.
- **Events:** editor update:modelValue(document), change on defined commit, focus/blur; CodeBlock `copy({success,error?})` after clipboard attempt. Clipboard failure must be visible.
- **Slots:** toolbar{editor}, leading/trailing, footer{selection,wordCount}; CodeBlock header, language, actions, line{line,index} if compatible with highlighter.
- **Hooks/behavior:** editor bg/text/selection/border, code bg/font/tab-size. Keep engine/highlighter optional, sanitize untrusted rendered HTML, and avoid v-html for arbitrary slot strings. Model migrations, collaboration and storage are adapter responsibilities.

## Public infrastructure (not visual catalog widgets)

`AvenProvider` supplies locale, translations, direction, density, default size, icon resolver, stable IDs and a themed overlay root. Composables can coordinate controlled values, roving focus, typeahead, placement, overlays and form reset. These internals should stay private until independent reuse and API stability are proven. Provider defaults must not require a global mutable store or browser APIs during import.

Optional `AvenConfig` types should permit only documented defaults and translations, not arbitrary mutation of every component's behavior. Every untranslated fallback label must be documented; apps should be able to replace clear/remove/close/next/previous/loading/no-results messages consistently.

## Component coverage and acceptance matrix

| Family | Required state/edge cases |
| --- | --- |
| All visible components | Light, dark, system, nested theme, contrast/forced colors, narrow width, long labels, RTL, custom tokens, unstyled replacement skin |
| Actions | Default/hover/active/focus-visible/disabled/loading, native form type, click once, icon accessible name |
| Fields | Empty/filled/readonly/disabled/invalid/required, native submit/reset, help/error IDs, autofill, IME, clear, focus retention |
| Choices | No selection/single/multiple/partial, disabled options, missing selected option data, typeahead, refresh by stable key |
| Overlays | Every placement, viewport clipping, zoom, scrolling ancestor, nested modal/menu, outside press, Escape, focus return, theme changes while open |
| Data | Loading/empty/no-results/error/partial/stale, pagination, reordered rows, selection across pages, slow async updates, virtualization focus |
| Dates/numbers | Locale formatting, invalid drafts, boundary values, empty/null/zero distinction, timezone-free date storage, app timezone adapter |
| Slots/parts | Each named slot replaced in a real example; semantics and keyboard behavior retained; ui hooks target documented parts |

For each component's first implementation, turn the relevant rows into focused tests and playground examples. Do not claim the whole catalog implemented merely because shared types or visual mockups exist.

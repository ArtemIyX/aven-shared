import type { AvenOpenChange, AvenOpenReason } from './composables.js'

export type AvenSize = 'xs' | 'sm' | 'md' | 'lg'
export type AvenTone =
  'neutral' | 'accent' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'critical'
export type AvenUiPart = {
  class?: string | string[] | Record<string, boolean>
  style?: import('vue').CSSProperties
  attrs?: Record<string, unknown>
}
export type AvenUi<Part extends string> = Partial<Record<Part, AvenUiPart>>
export type AvenOption<T, Extra extends object = object> = {
  value: T
  label: string
  disabled?: boolean
  description?: string
  group?: string | number
  keywords?: string[]
} & Extra
export type AvenListboxProps<T extends string | number = string | number> = {
  modelValue?: T | T[] | null
  defaultValue?: T | T[] | null
  options: AvenOption<T>[]
  multiple?: boolean
  orientation?: 'vertical' | 'horizontal'
  selectionBehavior?: 'toggle' | 'replace'
  loop?: boolean
  disabled?: boolean
  readonly?: boolean
  id?: string
  name?: string
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'option' | 'group' | 'indicator' | 'empty'>
}
export type AvenListboxEvents<T extends string | number = string | number> = {
  'update:modelValue': [value: T | T[] | null]
  change: [value: T | T[] | null]
  highlight: [payload: { value: T; index: number; originalEvent: Event }]
  endReached: [payload: { lastKey: T }]
}
export type AvenListboxItemSlot<T extends string | number = string | number> = {
  item: AvenOption<T>
  key: T
  index: number
  selected: boolean
  active: boolean
  disabled: boolean
}
export type AvenListboxSlots<T extends string | number = string | number> = {
  item?: (scope: AvenListboxItemSlot<T>) => unknown
  group?: (scope: { group: string | number }) => unknown
  indicator?: (scope: { selected: boolean }) => unknown
  empty?: () => unknown
  header?: () => unknown
  footer?: () => unknown
  separator?: () => unknown
}
export type AvenSliderMark = { value: number; label?: string }
export type AvenSliderProps = {
  modelValue?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  orientation?: 'horizontal' | 'vertical'
  marks?: AvenSliderMark[]
  label?: string
  formatValue?: (value: number) => string
  inverted?: boolean
  disabled?: boolean
  readonly?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'track' | 'input' | 'mark'>
}
export type AvenSliderEvents = {
  'update:modelValue': [value: number]
  change: [value: number]
  dragStart: [payload: { thumb: 0; value: number }]
  dragEnd: [payload: { thumb: 0; value: number }]
}
export type AvenSliderSlots = {
  leading?: () => unknown
  trailing?: () => unknown
  mark?: (scope: AvenSliderMark) => unknown
  value?: (scope: { value: number; index: 0 }) => unknown
}
export type AvenRangeSliderProps = Omit<
  AvenSliderProps,
  'modelValue' | 'defaultValue' | 'formatValue' | 'ui'
> & {
  modelValue?: [number, number]
  defaultValue?: [number, number]
  minGap?: number
  startLabel?: string
  endLabel?: string
  formatValue?: (value: number, index: 0 | 1) => string
  ui?: AvenUi<'root' | 'track' | 'input' | 'mark' | 'thumb'>
}
export type AvenRangeSliderEvents = {
  'update:modelValue': [value: [number, number]]
  change: [value: [number, number]]
  dragStart: [payload: { thumb: 0 | 1; value: [number, number] }]
  dragEnd: [payload: { thumb: 0 | 1; value: [number, number] }]
}
export type AvenRangeSliderSlots = {
  leading?: () => unknown
  trailing?: () => unknown
  mark?: (scope: AvenSliderMark) => unknown
  value?: (scope: { value: number; index: 0 | 1 }) => unknown
}
export type AvenComboboxProps<T extends string | number = string | number> = {
  modelValue?: T | T[] | null
  defaultValue?: T | T[] | null
  options: AvenOption<T>[]
  multiple?: boolean
  query?: string
  defaultQuery?: string
  filter?: (option: AvenOption<T>, query: string) => boolean
  remote?: boolean
  loading?: boolean
  activeKey?: T | null
  defaultActiveKey?: T | null
  error?: string
  clearable?: boolean
  clearLabel?: string
  creatable?: boolean
  maxSelected?: number
  open?: boolean
  defaultOpen?: boolean
  placement?: 'top' | 'bottom'
  popupWidth?: string
  placeholder?: string
  label?: string
  description?: string
  required?: boolean
  requiredMessage?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  id?: string
  name?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'control' | 'leading' | 'trailing' | 'popup' | 'option' | 'chip' | 'clear'>
}
export type AvenMultiSelectProps<T extends string | number = string | number> = Omit<
  AvenComboboxProps<T>,
  'multiple' | 'modelValue' | 'defaultValue'
> & {
  modelValue?: T[]
  defaultValue?: T[]
}
export type AvenComboboxEvents<T extends string | number = string | number> = {
  'update:modelValue': [value: T | T[] | null]
  change: [value: T | T[] | null]
  'update:query': [query: string]
  'update:activeKey': [key: T | null]
  create: [payload: { query: string; originalEvent: Event }]
  clear: [payload: { previousValue: T | T[] | null }]
  remove: [payload: { value: T; originalEvent: Event }]
  'update:open': [open: boolean]
  openChange: [change: AvenOpenChange]
  loadMore: [payload: { query: string; lastKey: T }]
  select: [payload: { key: T; item: AvenOption<T>; originalEvent: Event }]
  highlight: [payload: { key: T; item: AvenOption<T> }]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
export type AvenComboboxOptionSlot<T extends string | number = string | number> = {
  item: AvenOption<T>
  key: T
  index: number
  selected: boolean
  active: boolean
  disabled: boolean
}
export type AvenComboboxSlots<T extends string | number = string | number> = {
  selected?: (scope: { items: AvenOption<T>[] }) => unknown
  chip?: (scope: {
    item: AvenOption<T>
    remove: (event: MouseEvent) => void
    disabled: boolean
  }) => unknown
  option?: (scope: AvenComboboxOptionSlot<T>) => unknown
  group?: (scope: { group: string | number }) => unknown
  leading?: () => unknown
  trailing?: () => unknown
  empty?: (scope: { query: string }) => unknown
  loading?: () => unknown
  error?: (scope: { error: string }) => unknown
  create?: (scope: { query: string }) => unknown
  'popup-header'?: () => unknown
  'popup-footer'?: () => unknown
  label?: () => unknown
  description?: () => unknown
}
export type AvenMultiSelectEvents<T extends string | number = string | number> = Omit<
  AvenComboboxEvents<T>,
  'update:modelValue' | 'change'
> & {
  'update:modelValue': [value: T[]]
  change: [value: T[]]
}
export type AvenContextMenuProps<Key extends string | number = string | number> = {
  items: AvenCommand<Key>[]
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  activation?: 'contextmenu' | 'both'
  label?: string
  triggerLabel?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'trigger' | 'content' | 'item'>
}
export type AvenContextMenuEvents<Key extends string | number = string | number> = {
  'update:open': [open: boolean]
  openChange: [
    change: {
      open: boolean
      reason:
        'contextmenu' | 'keyboard' | 'trigger' | 'selection' | 'escape' | 'outside' | 'programmatic'
      point?: { x: number; y: number }
    },
  ]
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
}
export type AvenContextMenuSlots<Key extends string | number = string | number> = {
  default?: (scope: { openAt: (x: number, y: number) => void; open: boolean }) => unknown
  trigger?: (scope: { triggerAttrs: Record<string, unknown>; open: boolean }) => unknown
  item?: (scope: {
    item: AvenCommand<Key>
    key: Key
    active: boolean
    disabled: boolean
  }) => unknown
  header?: () => unknown
  footer?: () => unknown
}
export type AvenMenubarProps<Key extends string | number = string | number> = {
  items: AvenCommand<Key>[]
  activeKey?: Key | null
  defaultActiveKey?: Key | null
  openKey?: Key | null
  defaultOpenKey?: Key | null
  loop?: boolean
  label: string
  density?: 'comfortable' | 'compact'
  disabled?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'trigger' | 'submenu' | 'item'>
}
export type AvenMenubarEvents<Key extends string | number = string | number> = {
  'update:activeKey': [key: Key | null]
  'update:openKey': [key: Key | null]
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
  submenuChange: [payload: { key: Key; open: boolean }]
}
export type AvenMenubarSlots<Key extends string | number = string | number> = {
  trigger?: (scope: {
    item: AvenCommand<Key>
    open: boolean
    active: boolean
    triggerAttrs: Record<string, unknown>
    triggerRef: (element: unknown) => void
  }) => unknown
  item?: (scope: {
    item: AvenCommand<Key>
    key: Key
    active: boolean
    disabled: boolean
  }) => unknown
  'submenu-trigger'?: (scope: { item: AvenCommand<Key>; open: boolean }) => unknown
  header?: () => unknown
  footer?: () => unknown
}
export type AvenCommand<Key extends string | number = string | number> = {
  key: Key
  label: string
  description?: string
  disabled?: boolean
  tone?: AvenTone
  shortcut?: string
  children?: AvenCommand<Key>[]
}
export type AvenDialogProps = {
  open?: boolean
  defaultOpen?: boolean
  id?: string
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  closeOnEscape?: boolean
  closeOnOutside?: boolean
  showClose?: boolean
  initialFocus?: string
  restoreFocus?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'content' | 'header' | 'title' | 'description' | 'body' | 'footer' | 'close'>
}
export type AvenDialogEvents = {
  'update:open': [open: boolean]
  openChange: [change: AvenOpenChange]
  beforeClose: [
    payload: { reason: AvenOpenReason; originalEvent?: Event; preventDefault: () => void },
  ]
  afterOpen: []
  afterClose: []
}
export type AvenDialogSlots = {
  header?: (scope: { close: () => void }) => unknown
  title?: () => unknown
  description?: () => unknown
  default?: (scope: { close: () => void }) => unknown
  footer?: (scope: { close: () => void }) => unknown
  actions?: (scope: { close: () => void }) => unknown
  'close-icon'?: () => unknown
}
export type AvenAlertDialogProps = Omit<
  AvenDialogProps,
  'closeOnEscape' | 'closeOnOutside' | 'showClose' | 'ui'
> & {
  closeOnEscape?: boolean
  closeOnOutside?: boolean
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  cancelDisabled?: boolean
  loading?: boolean
  closeOnConfirm?: boolean
  ui?: AvenUi<
    | 'root'
    | 'content'
    | 'header'
    | 'title'
    | 'description'
    | 'body'
    | 'footer'
    | 'close'
    | 'confirm'
    | 'cancel'
  >
}
export type AvenAlertDialogEvents = AvenDialogEvents & {
  confirm: [payload: { originalEvent: Event }]
  cancel: [payload: { originalEvent?: Event }]
}
export type AvenAlertDialogSlots = Omit<AvenDialogSlots, 'actions'> & {
  actions?: (scope: {
    confirm: (event?: Event) => void
    cancel: (event?: Event) => void
    loading: boolean
  }) => unknown
  'confirm-label'?: () => unknown
}
export type AvenPaletteCommand<Key extends string | number = string | number> = AvenCommand<Key> & {
  group?: string
  keywords?: string[]
}
export type AvenCommandPaletteProps<Key extends string | number = string | number> = {
  open?: boolean
  defaultOpen?: boolean
  query?: string
  defaultQuery?: string
  activeKey?: Key | null
  defaultActiveKey?: Key | null
  items: AvenPaletteCommand<Key>[]
  loading?: boolean
  error?: string
  remote?: boolean
  filter?: (item: AvenPaletteCommand<Key>, query: string) => boolean
  closeOnSelect?: boolean
  placeholder?: string
  label?: string
  emptyText?: string
  unstyled?: boolean
  ui?: AvenUi<
    'root' | 'content' | 'header' | 'title' | 'description' | 'body' | 'input' | 'option' | 'footer'
  >
}
export type AvenCommandPaletteEvents<Key extends string | number = string | number> = Omit<
  AvenDialogEvents,
  'update:open'
> & {
  'update:open': [open: boolean]
  'update:query': [query: string]
  'update:activeKey': [key: Key | null]
  select: [payload: { key: Key; item: AvenPaletteCommand<Key>; originalEvent: Event }]
  highlight: [payload: { key: Key; item: AvenPaletteCommand<Key> }]
  loadMore: [payload: { query: string }]
}
export type AvenCommandPaletteSlots<Key extends string | number = string | number> = {
  'input-leading'?: () => unknown
  'input-trailing'?: () => unknown
  item?: (scope: {
    item: AvenPaletteCommand<Key>
    key: Key
    active: boolean
    disabled: boolean
  }) => unknown
  group?: (scope: { group: string }) => unknown
  shortcut?: (scope: { item: AvenPaletteCommand<Key> }) => unknown
  empty?: (scope: { query: string }) => unknown
  loading?: () => unknown
  footer?: () => unknown
}
export type AvenInputProps = {
  modelValue?: string
  defaultValue?: string
  type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  id?: string
  name?: string
  required?: boolean
  autocomplete?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  clearable?: boolean
  clearLabel?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'control' | 'leading' | 'trailing'>
}
export type AvenInputEvents = {
  'update:modelValue': [value: string]
  change: [value: string]
  clear: [payload: { previousValue: string; originalEvent: MouseEvent }]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  compositionstart: [event: CompositionEvent]
  compositionend: [event: CompositionEvent]
}
export type AvenSearchFieldProps = Omit<AvenInputProps, 'type' | 'ui'> & {
  debounce?: number
  label?: string
  description?: string
  error?: string | string[]
  ui?: AvenUi<'root' | 'control' | 'leading' | 'trailing' | 'clear'>
}
export type AvenSearchPayload = { query: string }
export type AvenSearchSubmitPayload = AvenSearchPayload & { originalEvent: KeyboardEvent }
export type AvenSearchFieldEvents = Omit<
  AvenInputEvents,
  'input' | 'compositionstart' | 'compositionend'
> & {
  search: [payload: AvenSearchPayload]
  submit: [payload: AvenSearchSubmitPayload]
}
export type AvenPasswordFieldProps = Omit<AvenInputProps, 'type' | 'ui'> & {
  revealed?: boolean
  defaultRevealed?: boolean
  revealable?: boolean
  revealLabel?: string
  hideLabel?: string
  label?: string
  description?: string
  error?: string | string[]
  ui?: AvenUi<'root' | 'control' | 'leading' | 'trailing' | 'revealButton'>
}
export type AvenPasswordFieldEvents = Omit<
  AvenInputEvents,
  'input' | 'compositionstart' | 'compositionend'
> & {
  'update:revealed': [value: boolean]
}
export type AvenRadioProps<T extends string | number = string | number> = {
  value: T
  checked?: boolean
  defaultChecked?: boolean
  label: string
  description?: string
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'control' | 'indicator' | 'label' | 'description'>
}
export type AvenRadioEvents<T extends string | number = string | number> = {
  'update:checked': [checked: boolean]
  change: [payload: { value: T; checked: boolean; originalEvent: Event }]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
export type AvenRadioGroupProps<T extends string | number = string | number> = {
  modelValue?: T | null
  defaultValue?: T | null
  items: AvenOption<T>[]
  name?: string
  id?: string
  label?: string
  description?: string
  error?: string
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  invalid?: boolean
  unstyled?: boolean
  ui?: AvenUi<
    'root' | 'legend' | 'description' | 'error' | 'item' | 'control' | 'indicator' | 'label'
  >
}
export type AvenRadioGroupEvents<T extends string | number = string | number> = {
  'update:modelValue': [value: T | null]
  change: [value: T]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
export type AvenRadioItemSlot<T extends string | number = string | number> = {
  item: AvenOption<T>
  key: T
  selected: boolean
  active: boolean
  disabled: boolean
}
export type AvenRadioGroupSlots<T extends string | number = string | number> = {
  label?: (scope: { required: boolean; invalid: boolean }) => unknown
  description?: () => unknown
  item?: (scope: AvenRadioItemSlot<T>) => unknown
  indicator?: (scope: { checked: boolean; item: AvenOption<T>; key: T }) => unknown
  error?: (scope: { message?: string }) => unknown
}
export type AvenRadioSlots = {
  label?: () => unknown
  description?: () => unknown
}
export type AvenToggleButtonProps = {
  modelValue?: boolean
  defaultValue?: boolean
  label?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label' | 'leading' | 'trailing' | 'indicator'>
}
export type AvenToggleButtonEvents = {
  'update:modelValue': [pressed: boolean]
  change: [pressed: boolean]
}
export type AvenToggleButtonSlots = {
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
  indicator?: (scope: { pressed: boolean }) => unknown
}
export type AvenToggleGroupProps<T extends string | number = string | number> = {
  modelValue?: T | T[] | null
  defaultValue?: T | T[] | null
  items: AvenOption<T>[]
  multiple?: boolean
  allowEmpty?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: AvenSize
  tone?: AvenTone
  label?: string
  name?: string
  disabled?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'item' | 'indicator' | 'leading' | 'trailing'>
}
export type AvenToggleGroupEvents<T extends string | number = string | number> = {
  'update:modelValue': [value: T | T[] | null]
  change: [value: T | T[] | null]
}
export type AvenToggleGroupItemSlot<T extends string | number = string | number> = {
  item: AvenOption<T>
  key: T
  selected: boolean
  active: boolean
  disabled: boolean
}
export type AvenToggleGroupSlots<T extends string | number = string | number> = {
  item?: (scope: AvenToggleGroupItemSlot<T>) => unknown
  leading?: (scope: { item: AvenOption<T> }) => unknown
  trailing?: (scope: { item: AvenOption<T> }) => unknown
  indicator?: (scope: { item: AvenOption<T>; selected: boolean }) => unknown
}
export type AvenSplitButtonProps<Key extends string | number = string | number> = {
  items: AvenCommand<Key>[]
  open?: boolean
  defaultOpen?: boolean
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  offset?: number
  closeOnSelect?: boolean
  primaryDisabled?: boolean
  menuDisabled?: boolean
  label?: string
  menuLabel?: string
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
  tone?: AvenTone
  size?: AvenSize
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  attached?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'primary' | 'trigger' | 'content'>
}
export type AvenSplitButtonEvents<Key extends string | number = string | number> = {
  click: [event: MouseEvent]
  'update:open': [open: boolean]
  openChange: [change: AvenOpenChange]
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
}
export type AvenSplitButtonSlots<Key extends string | number = string | number> = {
  default?: () => unknown
  leading?: (scope: { disabled: boolean; loading: boolean }) => unknown
  trigger?: (scope: {
    triggerAttrs: Record<string, unknown>
    triggerRef: (element: unknown) => void
    open: boolean
  }) => unknown
  'trigger-icon'?: (scope: { open: boolean }) => unknown
  item?: (scope: {
    item: AvenCommand<Key>
    key: Key
    active: boolean
    disabled: boolean
  }) => unknown
  'menu-header'?: () => unknown
  'menu-footer'?: () => unknown
}
export type AvenButtonGroupProps = {
  orientation?: 'horizontal' | 'vertical'
  attached?: boolean
  label?: string
  size?: AvenSize
  unstyled?: boolean
  ui?: AvenUi<'root'>
}
export type AvenButtonGroupSlots = {
  default?: () => unknown
}
export type AvenButtonProps = {
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
  tone?: AvenTone
  size?: AvenSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingBehavior?: 'block' | 'allow'
  block?: boolean
  shape?: 'rounded' | 'pill' | 'square'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label' | 'leading' | 'trailing' | 'spinner'>
}
export type AvenButtonEvents = {
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
export type AvenButtonSlots = {
  default?: () => unknown
  leading?: (scope: { disabled: boolean; loading: boolean }) => unknown
  trailing?: (scope: { disabled: boolean; loading: boolean }) => unknown
  loading?: (scope: { loading: boolean }) => unknown
}
export type AvenIconButtonProps = Omit<AvenButtonProps, 'block' | 'shape' | 'ui'> & {
  label: string
  shape?: 'square' | 'circle'
  tooltip?: string
  ui?: AvenUi<'root' | 'icon' | 'spinner'>
}
export type AvenIconButtonEvents = AvenButtonEvents
export type AvenIconButtonSlots = {
  icon?: () => unknown
  default?: () => unknown
  loading?: (scope: { loading: boolean }) => unknown
}
type AvenIconBaseProps = {
  name?: string
  size?: AvenSize | number
  strokeWidth?: number
  spin?: boolean
  tone?: AvenTone
  unstyled?: boolean
  ui?: AvenUi<'root' | 'svg'>
}
export type AvenIconRuntimeProps = AvenIconBaseProps & {
  decorative?: boolean
  label?: string
}
export type AvenIconProps = AvenIconBaseProps &
  ({ decorative?: true; label?: string } | { decorative: false; label: string })
export type AvenIconSlots = {
  default?: () => unknown
}
export type AvenLinkProps = {
  href: string
  target?: string
  rel?: string
  download?: string | boolean
  underline?: 'always' | 'hover' | 'none'
  variant?: 'default' | 'subtle' | 'standalone'
  tone?: AvenTone
  external?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'leading' | 'trailing'>
}
export type AvenLinkEvents = {
  click: [event: MouseEvent]
}
export type AvenLinkSlots = {
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
}
export type AvenBadgeProps = {
  tone?: AvenTone
  variant?: 'solid' | 'soft' | 'outline' | 'dot'
  size?: 'xs' | 'sm' | 'md'
  count?: number
  max?: number
  showZero?: boolean
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'leading' | 'trailing' | 'dot'>
}
export type AvenBadgeSlots = {
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
}
export type AvenStatusDotProps = {
  tone?: AvenTone
  size?: AvenSize
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'dot' | 'label'>
}
export type AvenStatusDotSlots = {
  default?: () => unknown
}
export type AvenFieldProps = {
  id?: string
  label?: string
  description?: string
  error?: string | string[]
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  optional?: boolean
  invalid?: boolean
  orientation?: 'vertical' | 'horizontal'
  labelWidth?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label' | 'description' | 'error' | 'control'>
}
export type AvenFieldSlots = {
  default?: (scope: {
    controlId: string
    descriptionId?: string
    errorId?: string
    invalid: boolean
    controlAttrs: Record<string, unknown>
  }) => unknown
  label?: (scope: { required: boolean; invalid: boolean }) => unknown
  description?: () => unknown
  error?: (scope: { messages: string[] }) => unknown
  before?: () => unknown
  after?: () => unknown
  actions?: () => unknown
}
export type AvenFieldsetProps = {
  legend?: string
  description?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'legend' | 'description' | 'content'>
}
export type AvenFieldsetSlots = {
  default?: () => unknown
  legend?: () => unknown
  description?: () => unknown
}

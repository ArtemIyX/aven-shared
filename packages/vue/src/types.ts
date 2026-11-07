import type { AvenOpenChange } from './composables.js'

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
export type AvenCommand<Key extends string | number = string | number> = {
  key: Key
  label: string
  description?: string
  disabled?: boolean
  tone?: AvenTone
  shortcut?: string
  children?: AvenCommand<Key>[]
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

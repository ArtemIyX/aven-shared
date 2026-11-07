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
export type AvenChipProps<T extends string | number = string | number> = {
  value?: T
  selected?: boolean
  removable?: boolean
  disabled?: boolean
  interactive?: boolean
  removeLabel?: string
  variant?: 'soft' | 'outline' | 'solid'
  tone?: AvenTone
  size?: AvenSize
  unstyled?: boolean
  ui?: AvenUi<'root' | 'content' | 'leading' | 'trailing' | 'remove'>
}
export type AvenChipEvents<T extends string | number = string | number> = {
  click: [event: MouseEvent]
  remove: [payload: { value?: T; originalEvent: MouseEvent }]
}
export type AvenChipSlots = {
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
  'remove-icon'?: () => unknown
}
export type AvenTagProps = {
  tone?: AvenTone
  variant?: 'soft' | 'outline' | 'solid'
  size?: AvenSize
  unstyled?: boolean
  ui?: AvenUi<'root' | 'leading' | 'trailing'>
}
export type AvenTagSlots = {
  default?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
}
export type AvenAvatarProps = {
  src?: string
  alt?: string
  name?: string
  initials?: string
  size?: AvenSize | 'xl'
  shape?: 'circle' | 'rounded' | 'square'
  loading?: 'lazy' | 'eager'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'image' | 'fallback' | 'status'>
}
export type AvenAvatarEvents = { load: [event: Event]; error: [event: Event] }
export type AvenAvatarSlots = {
  fallback?: (scope: { name?: string; initials: string }) => unknown
  status?: () => unknown
}
export type AvenAvatarGroupProps<T = unknown> = {
  items: T[]
  max?: number
  overlap?: number
  getKey?: (item: T, index: number) => string | number
  unstyled?: boolean
  label?: string
  ui?: AvenUi<'root' | 'avatar' | 'overflow'>
}
export type AvenAvatarGroupEvents<T = unknown> = {
  overflowClick: [payload: { hiddenItems: T[]; originalEvent: MouseEvent }]
}
export type AvenAvatarGroupSlots<T = unknown> = {
  avatar?: (scope: { item: T; index: number }) => unknown
  overflow?: (scope: { hiddenItems: T[]; count: number }) => unknown
}
export type AvenKbdProps = {
  keys?: string[]
  platform?: 'auto' | 'mac' | 'windows' | 'linux'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'key'>
}
export type AvenKbdSlots = { default?: () => unknown }
export type AvenSeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  inset?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label'>
}
export type AvenSeparatorSlots = { default?: () => unknown; label?: () => unknown }
export type AvenEmptyStateProps = {
  kind?: 'empty' | 'no-results' | 'error' | 'offline' | 'success'
  title: string
  description?: string
  tone?: AvenTone
  loading?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'icon' | 'title' | 'description' | 'actions' | 'footer'>
}
export type AvenEmptyStateEvents = {
  retry: [payload: { originalEvent: MouseEvent }]
}
export type AvenEmptyStateSlots = {
  illustration?: () => unknown
  icon?: () => unknown
  title?: () => unknown
  default?: () => unknown
  description?: () => unknown
  actions?: () => unknown
  footer?: () => unknown
}
export type AvenResultStateProps = AvenEmptyStateProps & {
  layout?: 'inline' | 'contained' | 'full-page'
  size?: 'compact' | 'large'
}
export type AvenResultStateEvents = AvenEmptyStateEvents
export type AvenResultStateSlots = AvenEmptyStateSlots
export type AvenToolbarGroup = { key: string | number; label?: string }
export type AvenToolbarProps = {
  orientation?: 'horizontal' | 'vertical'
  label: string
  density?: 'compact' | 'comfortable'
  wrap?: boolean
  keyboardNavigation?: boolean
  overflowItems?: unknown[]
  groups?: AvenToolbarGroup[]
  unstyled?: boolean
  ui?: AvenUi<'root' | 'start' | 'center' | 'end' | 'group' | 'overflow'>
}
export type AvenToolbarEvents = Record<never, never>
export type AvenToolbarSlots = {
  default?: () => unknown
  start?: () => unknown
  center?: () => unknown
  end?: () => unknown
  group?: (scope: { group: AvenToolbarGroup; key: string | number }) => unknown
  overflow?: (scope: { items: unknown[] }) => unknown
}
export type AvenActionBarProps = Omit<AvenToolbarProps, 'label'> & {
  label?: string
  selectionCount?: number
  clearable?: boolean
  clearLabel?: string
}
export type AvenActionBarEvents = {
  clearSelection: [payload: { originalEvent: MouseEvent }]
}
export type AvenActionBarSlots = Omit<AvenToolbarSlots, 'selection'> & {
  selection?: (scope: { count: number }) => unknown
  actions?: () => unknown
}
export type AvenToastKey = string | number
export type AvenToastAction = { label: string; key: string | number }
export type AvenToastItem<Key extends AvenToastKey = AvenToastKey> = {
  id: Key
  title?: string
  description?: string
  tone?: AvenTone
  duration?: number
  closable?: boolean
  action?: AvenToastAction
}
export type AvenToastProps<Key extends AvenToastKey = AvenToastKey> = AvenToastItem<Key> & {
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  live?: 'polite' | 'assertive' | 'off'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'icon' | 'content' | 'title' | 'description' | 'actions' | 'close'>
}
export type AvenToastEvents<Key extends AvenToastKey = AvenToastKey> = {
  dismiss: [payload: { id: Key; reason: 'timeout' | 'close' | 'action' | 'programmatic' }]
  action: [payload: { id: Key; key: string | number; originalEvent: MouseEvent }]
}
export type AvenToastSlots = {
  icon?: () => unknown
  title?: () => unknown
  default?: () => unknown
  action?: (scope: { action: AvenToastAction; dismiss: () => void }) => unknown
  'close-icon'?: () => unknown
}
export type AvenToasterProps<Key extends AvenToastKey = AvenToastKey> = {
  items: AvenToastItem<Key>[]
  position?:
    'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'
  maxVisible?: number
  gap?: string
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'toast'>
}
export type AvenToasterEvents<Key extends AvenToastKey = AvenToastKey> = {
  dismiss: AvenToastEvents<Key>['dismiss']
  action: AvenToastEvents<Key>['action']
  afterClose: [payload: { id: Key }]
}
export type AvenToasterSlots<Key extends AvenToastKey = AvenToastKey> = {
  toast?: (scope: { item: AvenToastItem<Key>; dismiss: () => void }) => unknown
}
export type AvenTextareaProps = {
  modelValue?: string
  defaultValue?: string
  rows?: number
  minRows?: number
  maxRows?: number
  autosize?: boolean
  resize?: 'vertical' | 'none' | 'both'
  maxlength?: number
  showCount?: boolean
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  name?: string
  id?: string
  invalid?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'control' | 'footer' | 'count' | 'leading' | 'trailing'>
}
export type AvenTextareaEvents = {
  'update:modelValue': [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  resize: [payload: { height: number }]
}
export type AvenTextareaSlots = {
  leading?: () => unknown
  trailing?: () => unknown
  footer?: (scope: { length: number; maxlength?: number }) => unknown
  count?: (scope: { length: number; maxlength?: number }) => unknown
}
export type AvenScrollAreaProps = {
  type?: 'auto' | 'always' | 'hover'
  orientation?: 'both' | 'horizontal' | 'vertical'
  label?: string
  notifyEnd?: boolean
  endThreshold?: number
  unstyled?: boolean
  ui?: AvenUi<'root' | 'corner'>
}
export type AvenScrollAreaEvents = {
  scroll: [event: Event]
  endReached: [payload: { axis: 'horizontal' | 'vertical' }]
}
export type AvenScrollAreaSlots = {
  default?: () => unknown
  corner?: () => unknown
}
export type AvenAppShellProps = {
  sidebarCollapsed?: boolean
  defaultSidebarCollapsed?: boolean
  inspectorOpen?: boolean
  defaultInspectorOpen?: boolean
  headerSticky?: boolean
  label?: string
  sidebarLabel?: string
  inspectorLabel?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'header' | 'sidebar' | 'main' | 'inspector' | 'footer' | 'statusbar'>
}
export type AvenAppShellEvents = {
  'update:sidebarCollapsed': [value: boolean]
  'update:inspectorOpen': [value: boolean]
}
export type AvenAppShellSlots = {
  header?: () => unknown
  sidebar?: () => unknown
  default?: () => unknown
  inspector?: () => unknown
  footer?: () => unknown
  statusbar?: () => unknown
  'sidebar-toggle'?: (scope: { collapsed: boolean; toggle: () => boolean }) => unknown
  'inspector-toggle'?: (scope: { open: boolean; toggle: () => boolean }) => unknown
}

export type AvenStepperItem<Key extends string | number = string | number> = {
  key: Key
  label: string
  description?: string
  status?: 'incomplete' | 'complete' | 'error'
  disabled?: boolean
}
export type AvenStepperProps<Key extends string | number = string | number> = {
  modelValue?: Key
  defaultValue?: Key
  items: AvenStepperItem<Key>[]
  linear?: boolean
  orientation?: 'horizontal' | 'vertical'
  clickable?: boolean
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'list' | 'step' | 'indicator' | 'connector' | 'label' | 'description'>
}
export type AvenStepperEvents<Key extends string | number = string | number> = {
  'update:modelValue': [value: Key]
  requestStep: [payload: { key: Key; from: Key | undefined; originalEvent: MouseEvent }]
}
export type AvenStepperItemSlot<Key extends string | number = string | number> = {
  item: AvenStepperItem<Key>
  index: number
  current: boolean
  completed: boolean
}
export type AvenStepperSlots<Key extends string | number = string | number> = {
  step?: (scope: AvenStepperItemSlot<Key>) => unknown
  indicator?: (scope: AvenStepperItemSlot<Key>) => unknown
  label?: (scope: AvenStepperItemSlot<Key>) => unknown
  description?: (scope: AvenStepperItemSlot<Key>) => unknown
  connector?: (scope: { index: number }) => unknown
}
export type AvenSplitPaneProps = {
  modelValue?: number[]
  defaultValue?: number[]
  panes?: number
  minSizes?: number[]
  maxSizes?: number[]
  orientation?: 'horizontal' | 'vertical'
  collapsible?: boolean
  resizeStep?: number
  labels?: string[]
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'pane' | 'handle'>
}
export type AvenSplitPaneEvents = {
  'update:modelValue': [sizes: number[]]
  resizeStart: [payload: { sizes: number[] }]
  resizeEnd: [payload: { sizes: number[] }]
}
export type AvenSplitPaneSlots = {
  pane?: (scope: { index: number; sizes: number[] }) => unknown
  handle?: (scope: { index: number; sizes: number[] }) => unknown
}
export type AvenListItemProps = {
  selected?: boolean
  disabled?: boolean
  dense?: boolean
  divided?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'leading' | 'content' | 'trailing' | 'separator'>
}
export type AvenListItemSlots = {
  leading?: () => unknown
  default?: () => unknown
  trailing?: () => unknown
  separator?: () => unknown
}
export type AvenListProps<T, Key extends string | number = string | number> = {
  items: T[]
  itemKey: (item: T, index: number) => Key
  getLabel?: (item: T, index: number) => string
  itemDisabled?: (item: T, index: number) => boolean
  loading?: boolean
  error?: boolean
  selectable?: boolean
  selectedKeys?: Key[]
  defaultSelectedKeys?: Key[]
  orientation?: 'vertical' | 'horizontal'
  label?: string
  divided?: boolean
  dense?: boolean
  endThreshold?: number
  unstyled?: boolean
  ui?: AvenUi<'root' | 'list' | 'item' | 'leading' | 'content' | 'trailing'>
}
export type AvenListEvents<T, Key extends string | number = string | number> = {
  'update:selectedKeys': [keys: Key[]]
  select: [payload: { key: Key; item: T; originalEvent: MouseEvent }]
  endReached: [payload: { lastKey: Key | undefined }]
  scroll: [event: Event]
}
export type AvenListItemSlot<T, Key extends string | number = string | number> = {
  item: T
  key: Key
  index: number
  selected: boolean
}
export type AvenListSlots<T, Key extends string | number = string | number> = {
  item?: (scope: AvenListItemSlot<T, Key>) => unknown
  leading?: (scope: AvenListItemSlot<T, Key>) => unknown
  trailing?: (scope: AvenListItemSlot<T, Key>) => unknown
  separator?: (scope: AvenListItemSlot<T, Key>) => unknown
  header?: () => unknown
  footer?: () => unknown
  loading?: () => unknown
  empty?: () => unknown
  error?: () => unknown
}
export type AvenVirtualListProps<T, Key extends string | number = string | number> = {
  items: T[]
  itemKey: (item: T, index: number) => Key
  estimateSize?: number
  overscan?: number
  orientation?: 'vertical' | 'horizontal'
  dir?: 'ltr' | 'rtl'
  label?: string
  loading?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'list' | 'item'>
}
export type AvenVirtualListEvents<T, Key extends string | number = string | number> = {
  rangeChange: [range: { start: number; end: number }]
  endReached: [payload: { lastKey: Key | undefined }]
  scroll: [event: Event]
}
export type AvenVirtualListSlots<T, Key extends string | number = string | number> = {
  item?: (scope: { item: T; key: Key; index: number }) => unknown
  loading?: () => unknown
  empty?: () => unknown
}
export type AvenTableProps = {
  caption?: string
  label?: string
  density?: 'comfortable' | 'compact'
  bordered?: boolean
  striped?: boolean
  stickyHeader?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'table' | 'caption'>
}
export type AvenTableSlots = {
  caption?: () => unknown
  default?: () => unknown
}
export type AvenTableColumn<T, ColumnKey extends string | number = string | number> = {
  key: ColumnKey
  header: string
  accessor: (row: T, index: number) => unknown
  align?: 'start' | 'center' | 'end'
  width?: string | number
  minWidth?: number
  maxWidth?: number
  sortable?: boolean
  format?: (value: unknown, row: T, index: number) => string | number
}
export type AvenTableSort<ColumnKey extends string | number = string | number> = {
  key: ColumnKey
  direction: 'asc' | 'desc'
}
export type AvenDataTableProps<
  T,
  Key extends string | number = string | number,
  ColumnKey extends string | number = string | number,
> = {
  rows: T[]
  columns: AvenTableColumn<T, ColumnKey>[]
  rowKey: (row: T, index: number) => Key
  sort?: AvenTableSort<ColumnKey>[]
  defaultSort?: AvenTableSort<ColumnKey>[]
  selectedKeys?: Key[]
  defaultSelectedKeys?: Key[]
  expandedKeys?: Key[]
  defaultExpandedKeys?: Key[]
  loading?: boolean
  error?: boolean
  rowCount?: number
  stickyHeader?: boolean
  manualSort?: boolean
  selectable?: boolean
  expandable?: boolean
  rowClickable?: boolean
  resizable?: boolean
  reorderable?: boolean
  multiSort?: boolean
  density?: 'comfortable' | 'compact'
  bordered?: boolean
  striped?: boolean
  label?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'table' | 'header' | 'row' | 'cell' | 'selection' | 'expansion'>
}
export type AvenDataTableEvents<
  T,
  Key extends string | number = string | number,
  ColumnKey extends string | number = string | number,
> = {
  'update:sort': [sort: AvenTableSort<ColumnKey>[]]
  'update:selectedKeys': [keys: Key[]]
  'update:expandedKeys': [keys: Key[]]
  rowClick: [payload: { row: T; key: Key; originalEvent: MouseEvent }]
  rowAction: [payload: { row: T; key: Key; action: string; originalEvent: MouseEvent }]
  columnResize: [payload: { key: ColumnKey; width: number }]
  columnReorder: [payload: { keys: ColumnKey[] }]
}
export type AvenDataTableSlots<
  T,
  Key extends string | number = string | number,
  ColumnKey extends string | number = string | number,
> = {
  caption?: () => unknown
  header?: (scope: {
    column: AvenTableColumn<T, ColumnKey>
    sort: AvenTableSort<ColumnKey> | undefined
  }) => unknown
  cell?: (scope: {
    row: T
    rowKey: Key
    column: AvenTableColumn<T, ColumnKey>
    value: unknown
    index: number
  }) => unknown
  rowLeading?: (scope: { row: T; rowKey: Key; selected: boolean }) => unknown
  rowTrailing?: (scope: {
    row: T
    rowKey: Key
    emitAction: (action: string, event: MouseEvent) => void
  }) => unknown
  expanded?: (scope: { row: T; key: Key }) => unknown
  footer?: () => unknown
  toolbar?: (scope: { selectedKeys: Key[] }) => unknown
  empty?: () => unknown
  loading?: () => unknown
  error?: () => unknown
  pagination?: (scope: { rowCount: number }) => unknown
}

export type AvenTimelineItem<Key extends string | number = string | number> = {
  key: Key
  timestamp: string | Date
  label: string
  description?: string
  details?: string
  status?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}
export type AvenTimelineProps<Key extends string | number = string | number> = {
  items: AvenTimelineItem<Key>[]
  order?: 'asc' | 'desc'
  density?: 'compact' | 'comfortable'
  locale?: string
  timeZone?: string
  loading?: boolean
  hasMore?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'list' | 'item' | 'indicator' | 'timestamp'>
}
export type AvenTimelineEvents<Key extends string | number = string | number> = {
  loadMore: [payload: { lastKey: Key }]
  expand: [payload: { key: Key; expanded: boolean }]
  action: [payload: { key: Key; action: string; originalEvent: Event }]
}
export type AvenTimelineSlots<Key extends string | number = string | number> = {
  item?: (scope: { item: AvenTimelineItem<Key>; index: number }) => unknown
  indicator?: (scope: { item: AvenTimelineItem<Key> }) => unknown
  timestamp?: (scope: { item: AvenTimelineItem<Key>; formatted: string }) => unknown
  title?: (scope: { item: AvenTimelineItem<Key> }) => unknown
  description?: (scope: { item: AvenTimelineItem<Key> }) => unknown
  details?: (scope: { item: AvenTimelineItem<Key> }) => unknown
  actions?: (scope: {
    item: AvenTimelineItem<Key>
    action: (action: string, originalEvent: Event) => void
  }) => unknown
  empty?: () => unknown
  loading?: () => unknown
  footer?: () => unknown
}
export type AvenSwitcherProps<T extends string | number = string | number> = {
  modelValue?: T | null
  defaultValue?: T | null
  options: AvenOption<T>[]
  label: string
  placeholder?: string
  name?: string
  searchable?: boolean
  loading?: boolean
  disabled?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'trigger' | 'popup' | 'option' | 'search'>
}
export type AvenSwitcherEvents<T extends string | number = string | number> = {
  'update:modelValue': [value: T]
  change: [value: T]
}
export type AvenSwitcherSlots<T extends string | number = string | number> = {
  trigger?: (scope: {
    item?: AvenOption<T>
    open: boolean
    triggerAttrs: Record<string, unknown>
    triggerRef: (element: unknown) => void
  }) => unknown
  option?: (scope: { item: AvenOption<T>; selected: boolean; active: boolean }) => unknown
  leading?: (scope: { item?: AvenOption<T> }) => unknown
  trailing?: (scope: { item?: AvenOption<T> }) => unknown
  header?: () => unknown
  footer?: () => unknown
}
export type AvenViewSwitcherProps<T extends string | number = string | number> = {
  modelValue?: T | null
  defaultValue?: T | null
  items: AvenOption<T, { icon?: unknown }>[]
  mode?: 'segments' | 'menu' | 'auto'
  label: string
  name?: string
  loading?: boolean
  disabled?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'view'>
}
export type AvenViewSwitcherEvents<T extends string | number = string | number> =
  AvenSwitcherEvents<T>
export type AvenViewSwitcherSlots<T extends string | number = string | number> = {
  trigger?: AvenSwitcherSlots<T>['trigger']
  option?: AvenSwitcherSlots<T>['option']
  view?: (scope: { item: AvenOption<T, { icon?: unknown }>; selected: boolean }) => unknown
  leading?: (scope: { item?: AvenOption<T> }) => unknown
  trailing?: (scope: { item?: AvenOption<T> }) => unknown
  header?: () => unknown
  footer?: () => unknown
}
export type AvenUploadItem = {
  key: string
  name: string
  size: number
  progress?: number
  status: 'queued' | 'uploading' | 'success' | 'error' | 'cancelled'
  error?: string
}
export type AvenFileInputProps = {
  modelValue?: File[]
  defaultValue?: File[]
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  loading?: boolean
  name?: string
  label?: string
  browseLabel?: string
  files?: AvenUploadItem[]
  dropzone?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'surface' | 'list' | 'file'>
}
export type AvenFileInputEvents = {
  'update:modelValue': [files: File[]]
  select: [payload: { files: File[]; originalEvent: Event }]
  reject: [
    payload: { files: File[]; reasons: Array<{ file: File; reason: 'type' | 'size' | 'count' }> },
  ]
  remove: [payload: { key: string }]
  retry: [payload: { key: string }]
  cancel: [payload: { key: string }]
}
export type AvenFileInputSlots = {
  default?: (scope: { dragging: boolean; open: () => void; disabled: boolean }) => unknown
  file?: (scope: {
    file: File | AvenUploadItem
    remove: () => void
    retry: () => void
    cancel: () => void
    disabled: boolean
  }) => unknown
  progress?: (scope: { file: AvenUploadItem; progress?: number }) => unknown
  empty?: () => unknown
  error?: (scope: {
    files: File[]
    reasons: Array<{ file: File; reason: 'type' | 'size' | 'count' }>
  }) => unknown
  actions?: () => unknown
}
export type AvenColorSwatch = { key: string; label: string; value: string }
export type AvenColorPickerProps = {
  modelValue?: string | null
  defaultValue?: string | null
  format?: 'hex' | 'hexa'
  swatches?: AvenColorSwatch[]
  alpha?: boolean
  clearable?: boolean
  open?: boolean
  defaultOpen?: boolean
  allowCustom?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  label?: string
  description?: string
  error?: string
  invalid?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'trigger' | 'input' | 'popover' | 'swatch'>
}
export type AvenColorPickerEvents = {
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  invalidInput: [payload: { text: string }]
  'update:open': [open: boolean]
  clear: [payload: { previousValue: string | null; originalEvent: Event }]
}
export type AvenColorPickerSlots = {
  trigger?: (scope: {
    triggerAttrs: Record<string, unknown>
    triggerRef: (element: unknown) => void
    value: string | null
    open: boolean
  }) => unknown
  swatch?: (scope: { item: AvenColorSwatch; selected: boolean }) => unknown
  value?: (scope: { value: string | null }) => unknown
  label?: () => unknown
  description?: () => unknown
  error?: () => unknown
  footer?: () => unknown
}
export type AvenDateOnly = `${string}-${string}-${string}`
export type AvenDatePreset = { key: string | number; label: string; value: AvenDateOnly }
export type AvenDateRangeValue = { start: AvenDateOnly | null; end: AvenDateOnly | null }
export type AvenDatePickerProps = {
  modelValue?: AvenDateOnly | null
  defaultValue?: AvenDateOnly | null
  min?: AvenDateOnly
  max?: AvenDateOnly
  disabledDate?: (date: AvenDateOnly) => boolean
  locale?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  months?: number
  presets?: AvenDatePreset[]
  clearable?: boolean
  open?: boolean
  defaultOpen?: boolean
  name?: string
  id?: string
  label?: string
  placeholder?: string
  description?: string
  error?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  unstyled?: boolean
  ui?: AvenUi<
    | 'root'
    | 'input'
    | 'trigger'
    | 'popover'
    | 'grid'
    | 'day'
    | 'selected'
    | 'range'
    | 'preset'
    | 'error'
  >
}
export type AvenDatePickerEvents = {
  'update:modelValue': [value: AvenDateOnly | null]
  change: [value: AvenDateOnly | null]
  'update:open': [value: boolean]
  monthChange: [value: { year: number; month: number }]
  invalidInput: [payload: { text: string; reason: 'incomplete' | 'invalid' }]
  presetSelect: [payload: { key: string | number; value: AvenDateOnly }]
}
export type AvenDatePickerSlots = {
  field?: (scope: {
    value: string
    open: boolean
    disabled: boolean
    openPicker: () => void
  }) => unknown
  day?: (scope: {
    date: AvenDateOnly
    selected: boolean
    today: boolean
    disabled: boolean
    inRange: boolean
  }) => unknown
  weekday?: (scope: { label: string; index: number }) => unknown
  preset?: (scope: { item: AvenDatePreset }) => unknown
  footer?: (scope: { apply: () => void; clear: () => void }) => unknown
}
export type AvenDateRangePickerProps = Omit<
  AvenDatePickerProps,
  'modelValue' | 'defaultValue' | 'min' | 'max' | 'presets'
> & {
  modelValue?: AvenDateRangeValue
  defaultValue?: AvenDateRangeValue
  min?: AvenDateOnly
  max?: AvenDateOnly
  presets?: Array<{ key: string | number; label: string; value: AvenDateRangeValue }>
}
export type AvenDateRangePickerEvents = Omit<
  AvenDatePickerEvents,
  'update:modelValue' | 'change' | 'presetSelect'
> & {
  'update:modelValue': [value: AvenDateRangeValue]
  change: [value: AvenDateRangeValue]
  presetSelect: [payload: { key: string | number; value: AvenDateRangeValue }]
}
export type AvenDateRangePickerSlots = Omit<AvenDatePickerSlots, 'day' | 'preset' | 'field'> & {
  field?: (scope: {
    value: AvenDateRangeValue
    open: boolean
    disabled: boolean
    openPicker: () => void
  }) => unknown
  day?: (scope: {
    date: AvenDateOnly
    selected: boolean
    today: boolean
    disabled: boolean
    inRange: boolean
  }) => unknown
  preset?: (scope: {
    item: { key: string | number; label: string; value: AvenDateRangeValue }
  }) => unknown
}
export type AvenFormError = { controlId: string; message: string }
export type AvenFormProps = {
  action?: string
  method?: 'get' | 'post' | 'dialog'
  novalidate?: boolean
  disabled?: boolean
  loading?: boolean
  errors?: AvenFormError[]
  columns?: number
  gap?: string
  unstyled?: boolean
  ui?: AvenUi<'root' | 'header' | 'body' | 'errorSummary' | 'footer'>
}
export type AvenFormEvents = { submit: [event: SubmitEvent]; reset: [event: Event] }
export type AvenFormSlots = {
  default?: (scope: { disabled: boolean; loading: boolean }) => unknown
  header?: () => unknown
  footer?: () => unknown
  'error-summary'?: (scope: { errors: AvenFormError[] }) => unknown
}
export type AvenFormActionsProps = {
  align?: 'start' | 'center' | 'end' | 'between'
  sticky?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'secondary' | 'primary'>
}
export type AvenFormActionsSlots = { default?: () => unknown; secondary?: () => unknown }
export type AvenTimePickerProps = {
  modelValue?: string | null
  defaultValue?: string | null
  min?: string
  max?: string
  locale?: string
  timeStep?: number
  hourCycle?: 'h12' | 'h23'
  seconds?: boolean
  clearable?: boolean
  name?: string
  id?: string
  label?: string
  description?: string
  error?: string
  invalid?: boolean
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'input' | 'control' | 'error'>
}
export type AvenTimePickerEvents = {
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  invalidInput: [payload: { text: string; reason: 'incomplete' | 'invalid' }]
}
export type AvenTimePickerSlots = {
  field?: (scope: { value: string; disabled: boolean }) => unknown
  'time-option'?: (scope: { value: string; label: string; selected: boolean }) => unknown
}
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
  submenu?: (scope: { item: AvenCommand<Key>; close: () => void }) => unknown
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
  kind?: 'action' | 'checkbox' | 'radio' | 'submenu'
  checked?: boolean
  value?: string | number
  group?: string | number
  children?: AvenCommand<Key>[]
}
export type AvenMenuGroupModel = { key: string | number; label: string }
export type AvenMenuProps<Key extends string | number = string | number> = {
  items: AvenCommand<Key>[]
  groups?: AvenMenuGroupModel[]
  id?: string
  loop?: boolean
  orientation?: 'vertical' | 'horizontal'
  typeahead?: boolean
  unstyled?: boolean
  ui?: AvenUi<
    'root' | 'item' | 'leading' | 'trailing' | 'shortcut' | 'group' | 'groupLabel' | 'empty'
  >
}
export type AvenMenuEvents<Key extends string | number = string | number> = {
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
  'update:checked': [payload: { key: Key; checked: boolean }]
  'update:value': [payload: { group: string | number; value: string | number }]
  highlight: [payload: { key: Key }]
  submenuChange: [payload: { key: Key; open: boolean }]
}
export type AvenMenuItemProps<Key extends string | number = string | number> = {
  item: AvenCommand<Key>
  id?: string
  active?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'item' | 'leading' | 'trailing' | 'shortcut' | 'submenu'>
}
export type AvenMenuItemEvents<Key extends string | number = string | number> = AvenMenuEvents<Key>
export type AvenMenuItemSlots<Key extends string | number = string | number> = {
  default?: (scope: {
    item: AvenCommand<Key>
    active: boolean
    disabled: boolean
    checked: boolean
  }) => unknown
  leading?: (scope: { item: AvenCommand<Key> }) => unknown
  trailing?: (scope: { item: AvenCommand<Key> }) => unknown
  shortcut?: (scope: { item: AvenCommand<Key> }) => unknown
  'submenu-trigger'?: (scope: { item: AvenCommand<Key>; open: boolean }) => unknown
  submenu?: (scope: { item: AvenCommand<Key>; close: () => void }) => unknown
}
export type AvenMenuGroupProps = {
  label?: string
  id?: string
  decorative?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label'>
}
export type AvenMenuGroupSlots = { default?: () => unknown; label?: () => unknown }
export type AvenCardProps = {
  as?: 'article' | 'section' | 'div'
  title?: string
  description?: string
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'header' | 'body' | 'footer' | 'title' | 'description' | 'actions'>
}
export type AvenCardSlots = {
  header?: () => unknown
  title?: () => unknown
  description?: () => unknown
  default?: () => unknown
  footer?: () => unknown
  actions?: () => unknown
}
export type AvenPanelProps = {
  as?: 'article' | 'section' | 'div' | 'aside'
  title?: string
  description?: string
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'flat' | 'outline' | 'raised'
  headerDivider?: boolean
  unstyled?: boolean
  ui?: AvenUi<
    | 'root'
    | 'header'
    | 'title'
    | 'description'
    | 'body'
    | 'footer'
    | 'actions'
    | 'leading'
    | 'trailing'
  >
}
export type AvenPanelSlots = {
  header?: () => unknown
  title?: () => unknown
  description?: () => unknown
  default?: () => unknown
  footer?: () => unknown
  actions?: () => unknown
  leading?: () => unknown
  trailing?: () => unknown
}
export type AvenPropertyRowProps = {
  label: string
  value?: string | number
  description?: string
  orientation?: 'horizontal' | 'vertical'
  labelWidth?: string
  truncate?: boolean
  editable?: boolean
  unstyled?: boolean
  ui?: AvenUi<'root' | 'label' | 'value' | 'description' | 'help' | 'editor' | 'edit'>
}
export type AvenPropertyRowEvents = {
  edit: [payload: { originalEvent: MouseEvent }]
  finish: []
  cancel: []
}
export type AvenPropertyRowSlots = {
  label?: () => unknown
  default?: () => unknown
  description?: () => unknown
  help?: () => unknown
  editor?: (scope: { finish: () => void; cancel: () => void }) => unknown
  'edit-icon'?: () => unknown
}
export type AvenDialogProps = {
  open?: boolean
  defaultOpen?: boolean
  id?: string
  modal?: boolean
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
export type AvenDrawerProps = Omit<AvenDialogProps, 'size' | 'ui'> & {
  side?: 'start' | 'end' | 'top' | 'bottom'
  size?: string
  defaultSize?: string
  minSize?: number | string
  maxSize?: number | string
  resizable?: boolean
  resizeDisabled?: boolean
  ui?: AvenUi<
    | 'root'
    | 'content'
    | 'header'
    | 'title'
    | 'description'
    | 'body'
    | 'footer'
    | 'close'
    | 'resizeHandle'
  >
}
export type AvenDrawerEvents = AvenDialogEvents & {
  'update:size': [size: string]
  resizeStart: [payload: { size: string }]
  resizeEnd: [payload: { size: string }]
}
export type AvenDrawerSlots = Omit<AvenDialogSlots, 'actions'> & {
  actions?: (scope: { close: () => void }) => unknown
  'resize-handle'?: (scope: { size: string }) => unknown
}
export type AvenSheetProps = AvenDrawerProps
export type AvenSheetEvents = AvenDrawerEvents
export type AvenSheetSlots = AvenDrawerSlots
export type AvenAlertProps = {
  tone?: Extract<AvenTone, 'info' | 'success' | 'warning' | 'danger' | 'critical'>
  variant?: 'soft' | 'outline' | 'solid'
  title?: string
  description?: string
  dismissible?: boolean
  dismissLabel?: string
  live?: 'off' | 'polite' | 'assertive'
  unstyled?: boolean
  ui?: AvenUi<'root' | 'icon' | 'title' | 'content' | 'actions' | 'close'>
}
export type AvenAlertEvents = {
  dismiss: [payload: { originalEvent: MouseEvent }]
}
export type AvenAlertSlots = {
  icon?: () => unknown
  title?: () => unknown
  default?: () => unknown
  actions?: () => unknown
  'close-icon'?: () => unknown
}
export type AvenBannerProps = AvenAlertProps
export type AvenBannerEvents = AvenAlertEvents
export type AvenBannerSlots = AvenAlertSlots
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

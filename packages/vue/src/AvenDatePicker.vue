<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvenCalendar from './AvenCalendar.vue'
import { parseDateOnly, toDateOnly, type DateOnly } from './dateOnly.js'
import { useAvenId } from './composables.js'
import type { AvenDatePickerEvents, AvenDatePickerProps, AvenDatePickerSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenDatePickerProps>(), {
  defaultValue: null,
  locale: 'en',
  weekStartsOn: 0,
  months: 1,
  clearable: false,
  disabled: false,
  readonly: false,
  required: false,
  unstyled: false,
})
const emit = defineEmits<AvenDatePickerEvents>()
const slots = defineSlots<AvenDatePickerSlots>()
const controlId = useAvenId(props.id, 'date-picker')
const local = ref<DateOnly | null>(props.defaultValue ?? null),
  draft = ref(''),
  focused = ref(false),
  month = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }),
  isOpen = ref(props.defaultOpen ?? false),
  field = ref<HTMLInputElement>(),
  panel = ref<HTMLElement>()
const root = ref<HTMLElement>()
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value)),
  open = computed(() => (props.open !== undefined ? props.open : isOpen.value))
const today = computed(() => {
  const d = new Date()
  return toDateOnly(d.getFullYear(), d.getMonth() + 1, d.getDate())
})
watch(
  value,
  (v) => {
    if (!focused.value) draft.value = v ?? ''
  },
  { immediate: true },
)
watch(
  value,
  (v) => {
    if (v) {
      const p = parseDateOnly(v)
      if (p) month.value = { year: p.year, month: p.month }
    }
  },
  { immediate: true },
)
function setOpen(next: boolean) {
  if (next && (props.disabled || props.readonly)) return
  if (open.value === next) return
  if (props.open === undefined) isOpen.value = next
  emit('update:open', next)
}
function setMonth(v: { year: number; month: number }) {
  month.value = v
  emit('monthChange', v)
}
function commit(next: DateOnly | null) {
  if (props.disabled || props.readonly) return
  if (next !== null && !parseDateOnly(next)) return
  if (
    next !== null &&
    ((props.min && next < props.min) ||
      (props.max && next > props.max) ||
      props.disabledDate?.(next))
  )
    return
  const previous = value.value
  if (previous === next) return
  local.value = next
  draft.value = next ?? ''
  emit('update:modelValue', next)
  emit('change', next)
}
function choose(v: DateOnly) {
  commit(v)
  setOpen(false)
  field.value?.focus()
}
function input(text: string) {
  if (props.disabled || props.readonly) return
  draft.value = text
  if (text === '' && props.clearable) commit(null)
  else if (parseDateOnly(text)) commit(text as DateOnly)
}
function blur() {
  focused.value = false
  const date = parseDateOnly(draft.value) ? (draft.value as DateOnly) : null
  if (draft.value && (!date || !allowed(date))) {
    emit('invalidInput', {
      text: draft.value,
      reason: /^\d{4}-\d{2}-\d{2}$/.test(draft.value) ? 'invalid' : 'incomplete',
    })
    draft.value = value.value ?? ''
  }
}
function allowed(date: DateOnly) {
  return (
    (!props.min || date >= props.min) &&
    (!props.max || date <= props.max) &&
    !props.disabledDate?.(date)
  )
}
function selectPreset(preset: NonNullable<AvenDatePickerProps['presets']>[number]) {
  commit(preset.value)
  emit('presetSelect', { key: preset.key, value: preset.value })
  setOpen(false)
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && (event.altKey || !open.value)) {
    event.preventDefault()
    setOpen(true)
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    setOpen(false)
    field.value?.focus()
  }
}
function closeFromKeyboard() {
  setOpen(false)
  field.value?.focus()
}
function reset(event: Event) {
  if (event.defaultPrevented || props.modelValue !== undefined) return
  local.value = props.defaultValue ?? null
  draft.value = local.value ?? ''
  setOpen(false)
}
function outside(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) setOpen(false)
}
watch(open, (next) => {
  if (next)
    nextTick(() =>
      panel.value?.querySelector<HTMLElement>('[role="gridcell"]:not(:disabled)')?.focus(),
    )
})
onMounted(() => {
  field.value?.form?.addEventListener('reset', reset)
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', outside)
  if (open.value)
    nextTick(() =>
      panel.value?.querySelector<HTMLElement>('[role="gridcell"]:not(:disabled)')?.focus(),
    )
})
onBeforeUnmount(() => {
  field.value?.form?.removeEventListener('reset', reset)
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', outside)
})
defineExpose({
  focus: () => field.value?.focus(),
  open: () => setOpen(true),
  close: () => setOpen(false),
})
</script>
<template>
  <div
    ref="root"
    class="aven-date-picker"
    :class="[{ disabled, unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    @keydown.esc.stop.prevent="closeFromKeyboard"
  >
    <label v-if="label" class="date-label" :for="controlId"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <slot
      name="field"
      :value="draft"
      :open="open"
      :disabled="disabled"
      :open-picker="() => setOpen(true)"
    >
      <div class="date-control">
        <input
          ref="field"
          v-bind="{ ...$attrs, ...ui?.input?.attrs }"
          :id="controlId"
          type="text"
          inputmode="numeric"
          :value="draft"
          :placeholder="placeholder ?? 'YYYY-MM-DD'"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :class="ui?.input?.class"
          :style="ui?.input?.style"
          :aria-invalid="invalid || undefined"
          :aria-describedby="
            [description ? `${controlId}-description` : null, error ? `${controlId}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @focus="focused = true"
          @blur="blur"
          @input="input(($event.target as HTMLInputElement).value)"
          @keydown="keydown"
        />
        <button
          v-bind="ui?.trigger?.attrs"
          type="button"
          :class="['open-button', ui?.trigger?.class]"
          :style="ui?.trigger?.style"
          :disabled="disabled || readonly"
          :aria-label="open ? 'Close calendar' : 'Open calendar'"
          :aria-expanded="open"
          @click="setOpen(!open)"
        >
          ▦</button
        ><button
          v-if="clearable && value"
          type="button"
          class="clear-button"
          :disabled="disabled || readonly"
          aria-label="Clear date"
          @click="commit(null)"
        >
          ×
        </button>
      </div>
    </slot>
    <p v-if="description" :id="`${controlId}-description`" class="help">{{ description }}</p>
    <p
      v-if="error"
      :id="`${controlId}-error`"
      :class="['error', ui?.error?.class]"
      :style="ui?.error?.style"
      role="alert"
    >
      {{ error }}
    </p>
    <input v-if="name" type="hidden" :name="name" :value="value ?? ''" :disabled="disabled" />
    <div
      v-if="open"
      ref="panel"
      :class="['calendar-popover', ui?.popover?.class]"
      :style="ui?.popover?.style"
      tabindex="-1"
      role="group"
      :aria-label="label ?? 'Choose date'"
    >
      <div class="calendars">
        <AvenCalendar
          v-for="offset in Math.max(1, months)"
          :key="`${month.year}-${month.month}-${offset}`"
          :year="month.year"
          :month="((((month.month + offset - 2) % 12) + 12) % 12) + 1"
          :model-value="value"
          :today="today"
          :locale="locale"
          :week-starts-on="weekStartsOn"
          :min="min"
          :max="max"
          :disabled-date="(date) => disabled || readonly || !!disabledDate?.(date)"
          :unstyled="unstyled"
          :ui="ui"
          @select="choose"
          @move-month="setMonth"
          ><template v-if="slots.day" #day="scope"><slot name="day" v-bind="scope" /></template
          ><template v-if="slots.weekday" #weekday="scope"
            ><slot name="weekday" v-bind="scope" /></template
        ></AvenCalendar>
      </div>
      <div v-if="presets?.length" class="presets">
        <button
          v-for="preset in presets"
          v-bind="ui?.preset?.attrs"
          :key="preset.key"
          type="button"
          :class="ui?.preset?.class"
          :style="ui?.preset?.style"
          :disabled="disabled || !!disabledDate?.(preset.value)"
          @click="selectPreset(preset)"
        >
          <slot name="preset" :item="preset">{{ preset.label }}</slot>
        </button>
      </div>
      <footer v-if="slots.footer">
        <slot name="footer" :apply="() => setOpen(false)" :clear="() => commit(null)" />
      </footer>
    </div>
  </div>
</template>
<style scoped>
.aven-date-picker {
  position: relative;
  display: grid;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  color: var(--aven-color-text-primary);
}
.date-label {
  font-weight: 600;
}
.date-control {
  display: flex;
  align-items: center;
  gap: var(--aven-space-1);
  min-block-size: 2.5rem;
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
}
.date-control:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.date-control input {
  flex: 1;
  min-inline-size: 0;
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.date-control button {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
}
.date-control button:focus-visible,
.presets button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.help,
.error {
  margin: 0;
  font-size: 0.875rem;
}
.help {
  color: var(--aven-color-text-secondary);
}
.error {
  color: var(--aven-color-text-invalid);
}
.calendar-popover {
  position: absolute;
  z-index: 20;
  inset-block-start: 100%;
  inset-inline-start: 0;
  display: grid;
  gap: var(--aven-space-2);
  max-inline-size: calc(100vw - 1rem);
  padding: var(--aven-space-2);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-raised);
  box-shadow: var(--aven-shadow-lg);
}
.calendars {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
}
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--aven-space-1);
}
.presets button {
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-2);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.disabled {
  opacity: 0.7;
}
.unstyled .date-control {
  border: 0;
  border-radius: 0;
}
.unstyled .calendar-popover {
  border: 0;
  box-shadow: none;
}
@media (max-width: 32rem) {
  .calendars {
    display: grid;
  }
  .calendar-popover {
    position: relative;
    inset: auto;
    max-inline-size: 100%;
  }
}
@media (forced-colors: active) {
  .calendar-popover,
  .date-control {
    border: 1px solid CanvasText;
  }
}
@media print {
  .calendar-popover {
    position: static;
    box-shadow: none;
  }
}
</style>

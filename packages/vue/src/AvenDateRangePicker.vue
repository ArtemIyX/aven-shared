<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvenCalendar from './AvenCalendar.vue'
import { parseDateOnly, toDateOnly, type DateOnly } from './dateOnly.js'
import { useAvenId } from './composables.js'
import type {
  AvenDateRangePickerEvents,
  AvenDateRangePickerProps,
  AvenDateRangePickerSlots,
  AvenDateRangeValue,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenDateRangePickerProps>(), {
  defaultValue: () => ({ start: null, end: null }),
  locale: 'en',
  weekStartsOn: 0,
  months: 1,
  clearable: false,
  disabled: false,
  readonly: false,
  required: false,
  unstyled: false,
})
const emit = defineEmits<AvenDateRangePickerEvents>(),
  slots = defineSlots<AvenDateRangePickerSlots>()
const controlId = useAvenId(props.id, 'date-range')
const local = ref<AvenDateRangeValue>({ ...props.defaultValue }),
  draftStart = ref(''),
  draftEnd = ref(''),
  openLocal = ref(props.defaultOpen ?? false),
  month = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 }),
  startInput = ref<HTMLInputElement>(),
  endInput = ref<HTMLInputElement>(),
  panel = ref<HTMLElement>(),
  choosingEnd = ref(false)
const root = ref<HTMLElement>()
const value = computed(() => props.modelValue ?? local.value),
  open = computed(() => (props.open !== undefined ? props.open : openLocal.value)),
  today = computed(() => {
    const d = new Date()
    return toDateOnly(d.getFullYear(), d.getMonth() + 1, d.getDate())
  })
watch(
  value,
  (v) => {
    draftStart.value = v.start ?? ''
    draftEnd.value = v.end ?? ''
  },
  { immediate: true },
)
watch(
  () => value.value.start,
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
  if (props.open === undefined) openLocal.value = next
  emit('update:open', next)
}
function setMonth(v: { year: number; month: number }) {
  month.value = v
  emit('monthChange', v)
}
function valid(d: DateOnly | null) {
  return (
    !props.disabled &&
    !props.readonly &&
    (!d ||
      ((!props.min || d >= props.min) &&
        (!props.max || d <= props.max) &&
        !props.disabledDate?.(d)))
  )
}
function update(next: AvenDateRangeValue, commit = false) {
  if (next.start && next.end && next.start > next.end) next = { start: next.end, end: next.start }
  local.value = next
  emit('update:modelValue', next)
  if (commit && next.start && next.end) emit('change', next)
}
function select(date: DateOnly) {
  if (!valid(date)) return
  if (!choosingEnd.value || !value.value.start) {
    choosingEnd.value = true
    update({ start: date, end: null })
    return
  }
  const next = { start: value.value.start, end: date }
  update(next, true)
  choosingEnd.value = false
  setOpen(false)
}
function selectPreset(preset: NonNullable<AvenDateRangePickerProps['presets']>[number]) {
  update(preset.value, true)
  emit('presetSelect', { key: preset.key, value: preset.value })
  setOpen(false)
}
function input(which: 'start' | 'end', text: string) {
  if (props.disabled || props.readonly) return
  if (which === 'start') draftStart.value = text
  else draftEnd.value = text
  const date = parseDateOnly(text) ? (text as DateOnly) : null
  if (text && !date) return
  if (date && !valid(date)) return
  const next = { ...value.value, [which]: date }
  update(next, !!next.start && !!next.end)
}
function blur(which: 'start' | 'end') {
  const text = which === 'start' ? draftStart.value : draftEnd.value
  const date = parseDateOnly(text) ? (text as DateOnly) : null
  if (text && (!date || !valid(date)))
    emit('invalidInput', {
      text,
      reason: /^\d{4}-\d{2}-\d{2}$/.test(text) ? 'invalid' : 'incomplete',
    })
}
function reset(e: Event) {
  if (e.defaultPrevented || props.modelValue !== undefined) return
  local.value = { ...props.defaultValue }
  draftStart.value = local.value.start ?? ''
  draftEnd.value = local.value.end ?? ''
  setOpen(false)
}
function closeFromKeyboard() {
  setOpen(false)
  startInput.value?.focus()
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
  startInput.value?.form?.addEventListener('reset', reset)
  if (typeof document !== 'undefined') document.addEventListener('pointerdown', outside)
  if (open.value)
    nextTick(() =>
      panel.value?.querySelector<HTMLElement>('[role="gridcell"]:not(:disabled)')?.focus(),
    )
})
onBeforeUnmount(() => {
  startInput.value?.form?.removeEventListener('reset', reset)
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', outside)
})
defineExpose({
  focus: () => startInput.value?.focus(),
  open: () => setOpen(true),
  close: () => setOpen(false),
})
</script>
<template>
  <div
    ref="root"
    class="aven-date-range"
    :class="[{ disabled, unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
    @keydown.esc.stop.prevent="closeFromKeyboard"
  >
    <span v-if="label" :id="`${controlId}-label`" class="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></span
    >
    <slot
      name="field"
      :value="value"
      :open="open"
      :disabled="disabled"
      :open-picker="() => setOpen(true)"
    >
      <div
        class="range-fields"
        role="group"
        :aria-labelledby="label ? `${controlId}-label` : undefined"
      >
        <input
          ref="startInput"
          v-bind="{ ...$attrs, ...ui?.input?.attrs }"
          :id="`${controlId}-start`"
          type="text"
          inputmode="numeric"
          :value="draftStart"
          placeholder="Start YYYY-MM-DD"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :class="ui?.input?.class"
          :style="ui?.input?.style"
          :aria-label="`${label ?? 'Date range'} start`"
          :aria-invalid="invalid || undefined"
          :aria-describedby="
            [description ? `${controlId}-description` : null, error ? `${controlId}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @input="input('start', ($event.target as HTMLInputElement).value)"
          @blur="blur('start')"
        /><span aria-hidden="true">–</span
        ><input
          ref="endInput"
          v-bind="ui?.input?.attrs"
          type="text"
          :id="`${controlId}-end`"
          inputmode="numeric"
          :value="draftEnd"
          placeholder="End YYYY-MM-DD"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :class="ui?.input?.class"
          :style="ui?.input?.style"
          :aria-label="`${label ?? 'Date range'} end`"
          :aria-invalid="invalid || undefined"
          :aria-describedby="
            [description ? `${controlId}-description` : null, error ? `${controlId}-error` : null]
              .filter(Boolean)
              .join(' ') || undefined
          "
          @input="input('end', ($event.target as HTMLInputElement).value)"
          @blur="blur('end')"
        /><button
          v-bind="ui?.trigger?.attrs"
          type="button"
          :class="ui?.trigger?.class"
          :style="ui?.trigger?.style"
          :disabled="disabled || readonly"
          :aria-label="open ? 'Close calendar' : 'Choose date range'"
          :aria-expanded="open"
          @click="setOpen(!open)"
        >
          ▦</button
        ><button
          v-if="clearable && (value.start || value.end)"
          type="button"
          :disabled="disabled || readonly"
          aria-label="Clear date range"
          @click="update({ start: null, end: null })"
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
    <input
      v-if="name"
      type="hidden"
      :name="`${name}[start]`"
      :value="value.start ?? ''"
      :disabled="disabled"
    /><input
      v-if="name"
      type="hidden"
      :name="`${name}[end]`"
      :value="value.end ?? ''"
      :disabled="disabled"
    />
    <div
      v-if="open"
      ref="panel"
      :class="['range-popover', ui?.popover?.class]"
      :style="ui?.popover?.style"
      role="group"
      :aria-label="`${label ?? 'Date range'} calendar`"
    >
      <div class="calendars">
        <AvenCalendar
          v-for="offset in Math.max(1, months)"
          :key="`${month.year}-${month.month}-${offset}`"
          :year="month.year"
          :month="((((month.month + offset - 2) % 12) + 12) % 12) + 1"
          :model-value="value.start"
          :range-end="value.end"
          :today="today"
          :locale="locale"
          :week-starts-on="weekStartsOn"
          :min="min"
          :max="max"
          :disabled-date="(date) => disabled || readonly || !!disabledDate?.(date)"
          range
          :ui="ui"
          @select="select"
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
          @click="selectPreset(preset)"
        >
          <slot name="preset" :item="preset">{{ preset.label }}</slot>
        </button>
      </div>
      <footer v-if="slots.footer">
        <slot
          name="footer"
          :apply="() => setOpen(false)"
          :clear="() => update({ start: null, end: null })"
        />
      </footer>
    </div>
  </div>
</template>
<style scoped>
.aven-date-range {
  position: relative;
  display: grid;
  gap: var(--aven-space-1);
  max-inline-size: 100%;
  color: var(--aven-color-text-primary);
}
.label {
  font-weight: 600;
}
.range-fields {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-2);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
}
.range-fields:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.range-fields input {
  inline-size: min(11rem, 40%);
  min-inline-size: 0;
  min-block-size: 2.25rem;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}
.range-fields button {
  min-inline-size: 2.5rem;
  min-block-size: 2.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
}
.range-fields button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
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
.range-popover {
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
}
@media (max-width: 32rem) {
  .calendars {
    display: grid;
  }
  .range-popover {
    position: relative;
    inset: auto;
    max-inline-size: 100%;
  }
}
@media (forced-colors: active) {
  .range-fields,
  .range-popover {
    border: 1px solid CanvasText;
  }
}
@media print {
  .range-popover {
    position: static;
    box-shadow: none;
  }
}
.unstyled .range-popover {
  border: 0;
  box-shadow: none;
}
</style>

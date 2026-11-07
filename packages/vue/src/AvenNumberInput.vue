<script setup lang="ts">
import { computed, ref, watch, useAttrs } from 'vue'
import type { AvenUi } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    modelValue?: number | null
    defaultValue?: number | null
    min?: number
    max?: number
    step?: number
    precision?: number
    locale?: string
    formatOptions?: Intl.NumberFormatOptions
    controls?: boolean
    clampOnCommit?: boolean
    allowEmpty?: boolean
    name?: string
    id?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    invalid?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root' | 'control' | 'prefix' | 'suffix' | 'stepper'>
  }>(),
  {
    defaultValue: null,
    step: 1,
    controls: true,
    clampOnCommit: true,
    allowEmpty: true,
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'update:inputValue': [value: string]
  change: [value: number | null]
  invalidInput: [payload: { text: string; reason: 'incomplete' | 'invalid' }]
  step: [
    payload: {
      direction: 'increment' | 'decrement'
      value: number
      originalEvent: MouseEvent | KeyboardEvent
    },
  ]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()
const attrs = useAttrs(),
  input = ref<HTMLInputElement>(),
  draft = ref(''),
  focused = ref(false),
  local = ref<number | null>(props.defaultValue ?? null)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const formatter = computed(() => new Intl.NumberFormat(props.locale, props.formatOptions))
const parts = computed(() => new Intl.NumberFormat(props.locale).formatToParts(12345.6))
const groupSep = computed(() => parts.value.find((p) => p.type === 'group')?.value ?? ',')
const decimalSep = computed(() => parts.value.find((p) => p.type === 'decimal')?.value ?? '.')
function display(v: number | null) {
  if (v === null) return ''
  return formatter.value.format(v)
}
function parse(text: string): number | null | undefined {
  const trimmed = text.trim()
  if (trimmed === '') return props.allowEmpty ? null : undefined
  let normalized = trimmed
    .split(groupSep.value)
    .join('')
    .replace(decimalSep.value, '.')
    .replace(/[\u00a0\u202f\s]/g, '')
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    const result = Number(normalized)
    return Number.isFinite(result) ? result : undefined
  }
  return undefined
}
watch(
  value,
  (v) => {
    if (!focused.value) draft.value = display(v)
  },
  { immediate: true },
)
watch(
  () => [props.locale, props.formatOptions],
  () => {
    if (!focused.value) draft.value = display(value.value)
  },
)
function report(text: string) {
  draft.value = text
  emit('update:inputValue', text)
  const parsed = parse(text)
  if (parsed !== undefined) {
    local.value = parsed
    emit('update:modelValue', parsed)
  } else if (text !== '' && !/^[-+.]$|^[+-]?\d+[.,]$/.test(text))
    emit('invalidInput', { text, reason: 'invalid' })
}
function commit() {
  const parsed = parse(draft.value)
  if (parsed === undefined) {
    emit('invalidInput', { text: draft.value, reason: 'incomplete' })
    draft.value = display(value.value)
    return
  }
  let next = parsed
  if (typeof next === 'number') {
    if (props.clampOnCommit) {
      if (props.min !== undefined) next = Math.max(next, props.min)
      if (props.max !== undefined) next = Math.min(next, props.max)
    }
    if (props.precision !== undefined) {
      const scale = 10 ** props.precision
      next = Math.round((next + Number.EPSILON) * scale) / scale
    }
  }
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
  draft.value = display(next)
}
function step(direction: 'increment' | 'decrement', originalEvent: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.readonly) return
  const base =
    typeof parse(draft.value) === 'number' ? (parse(draft.value) as number) : (value.value ?? 0)
  let next = base + (direction === 'increment' ? 1 : -1) * props.step
  if (props.min !== undefined) next = Math.max(next, props.min)
  if (props.max !== undefined) next = Math.min(next, props.max)
  report(String(next))
  emit('step', { direction, value: next, originalEvent })
  commit()
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    step('increment', e)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    step('decrement', e)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    commit()
  }
}
function onFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}
function onBlur(event: FocusEvent) {
  focused.value = false
  commit()
  emit('blur', event)
}
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
  select: () => input.value?.select(),
})
</script>
<template>
  <div
    :class="[
      'aven-number-input',
      { 'is-invalid': invalid, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <span v-if="$slots.prefix" :class="['number-prefix', ui?.prefix?.class]"
      ><slot name="prefix" /></span
    ><input
      ref="input"
      v-bind="{ ...attrs, ...ui?.control?.attrs }"
      :id="id"
      :class="['number-control', ui?.control?.class]"
      :style="ui?.control?.style"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="typeof value === 'number' ? value : undefined"
      :aria-invalid="invalid || undefined"
      :name="undefined"
      :value="draft"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      @focus="onFocus"
      @blur="onBlur"
      @input="report(($event.target as HTMLInputElement).value)"
      @keydown="keydown"
    /><input
      v-if="name"
      type="hidden"
      :name="name"
      :value="typeof value === 'number' ? value : ''"
      :disabled="disabled"
    /><span v-if="$slots.suffix" :class="['number-suffix', ui?.suffix?.class]"
      ><slot name="suffix" /></span
    ><span v-if="controls" class="number-steppers"
      ><button
        type="button"
        :class="ui?.stepper?.class"
        aria-label="Increase value"
        :disabled="disabled || readonly"
        @click="step('increment', $event)"
      >
        <slot name="increment-icon">+</slot></button
      ><button
        type="button"
        :class="ui?.stepper?.class"
        aria-label="Decrease value"
        :disabled="disabled || readonly"
        @click="step('decrement', $event)"
      >
        <slot name="decrement-icon">−</slot>
      </button></span
    >
  </div>
</template>
<style scoped>
.aven-number-input {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.aven-number-input:focus-within {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.number-control {
  flex: 1;
  min-inline-size: 0;
  block-size: 2rem;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
}
.number-control:disabled {
  color: var(--aven-color-text-disabled);
}
.number-prefix,
.number-suffix {
  color: var(--aven-color-text-secondary);
}
.number-steppers {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.number-steppers button {
  min-inline-size: 1.5rem;
  min-block-size: 1rem;
  padding: 0;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-hover);
  color: inherit;
  line-height: 1;
  cursor: pointer;
}
.number-steppers button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
}
.number-steppers button:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-invalid {
  border-color: var(--aven-color-border-invalid);
}
.is-disabled {
  background: var(--aven-color-surface-disabled);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, useAttrs } from 'vue'
import type { AvenNumberInputEvents, AvenNumberInputProps, AvenNumberInputSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenNumberInputProps>(), {
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
})
const emit = defineEmits<AvenNumberInputEvents>()
defineSlots<AvenNumberInputSlots>()
const attrs = useAttrs(),
  input = ref<HTMLInputElement>(),
  draft = ref(''),
  focused = ref(false),
  focusValue = ref<number | null>(props.defaultValue ?? null),
  lastInputRequest = ref<number | null | undefined>(undefined),
  local = ref<number | null>(props.defaultValue ?? null)
const value = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value))
const initialValue = props.defaultValue ?? null
const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.control?.attrs }
})
const formatter = computed(() => new Intl.NumberFormat(props.locale, props.formatOptions))
const editingFormatter = computed(
  () =>
    new Intl.NumberFormat(props.locale, {
      numberingSystem: formatter.value.resolvedOptions().numberingSystem,
      useGrouping: false,
      maximumFractionDigits: 20,
    }),
)
const localeSymbols = computed(() => {
  const numberingSystem = formatter.value.resolvedOptions().numberingSystem
  const symbols = new Intl.NumberFormat(props.locale, { numberingSystem })
  const parts = symbols.formatToParts(12345.6)
  const signed = new Intl.NumberFormat(props.locale, {
    numberingSystem,
    signDisplay: 'always',
  })
  const sign = (value: number, type: 'minusSign' | 'plusSign') =>
    signed.formatToParts(value).find((part) => part.type === type)?.value
  const digitFormatter = new Intl.NumberFormat(props.locale, {
    numberingSystem,
    useGrouping: false,
    maximumFractionDigits: 0,
  })
  const digits = Array.from(
    { length: 10 },
    (_, value) =>
      [
        digitFormatter.formatToParts(value).find((part) => part.type === 'integer')?.value ??
          String(value),
        String(value),
      ] as const,
  ).sort(([left], [right]) => right.length - left.length)
  return {
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    minus: sign(-1, 'minusSign') ?? '-',
    plus: sign(1, 'plusSign') ?? '+',
    digits,
  }
})
function display(v: number | null) {
  if (v === null) return ''
  return formatter.value.format(v)
}
function parse(text: string): number | null | undefined {
  const trimmed = text.trim()
  if (trimmed === '') return props.allowEmpty ? null : undefined
  const symbols = localeSymbols.value
  let normalized = trimmed
    .replace(/\p{Cf}/gu, '')
    .split(symbols.group)
    .join('')
    .replace(symbols.decimal, '.')
    .replace(/[\u00a0\u202f\s]/g, '')
    .split(symbols.minus.replace(/\p{Cf}/gu, ''))
    .join('-')
    .split(symbols.plus.replace(/\p{Cf}/gu, ''))
    .join('+')
  for (const [localized, ascii] of symbols.digits)
    normalized = normalized.split(localized).join(ascii)
  if (/^[+-]?$|^[+-]?\d+\.$/.test(normalized)) return undefined
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
  if (props.disabled || props.readonly) return
  draft.value = text
  emit('update:inputValue', text)
  const parsed = parse(text)
  if (parsed !== undefined) {
    const changed = !Object.is(parsed, value.value)
    local.value = parsed
    if (changed) {
      lastInputRequest.value = parsed
      emit('update:modelValue', parsed)
    }
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
  const valueChanged = !Object.is(next, value.value)
  const changedDuringEdit = !Object.is(next, focusValue.value)
  local.value = next
  if (valueChanged && !Object.is(lastInputRequest.value, next)) emit('update:modelValue', next)
  if (changedDuringEdit) emit('change', next)
  focusValue.value = next
  draft.value = display(next)
}
function step(direction: 'increment' | 'decrement', originalEvent: MouseEvent | KeyboardEvent) {
  if (props.disabled || props.readonly) return
  const base =
    typeof parse(draft.value) === 'number' ? (parse(draft.value) as number) : (value.value ?? 0)
  let next = base + (direction === 'increment' ? 1 : -1) * props.step
  if (props.min !== undefined) next = Math.max(next, props.min)
  if (props.max !== undefined) next = Math.min(next, props.max)
  if (props.precision !== undefined) {
    const scale = 10 ** props.precision
    next = Math.round((next + Number.EPSILON) * scale) / scale
  }
  const changed = !Object.is(next, value.value)
  local.value = next
  draft.value = display(next)
  emit('update:inputValue', draft.value)
  if (changed) {
    lastInputRequest.value = next
    emit('update:modelValue', next)
  }
  emit('step', { direction, value: next, originalEvent })
  if (changed) emit('change', next)
  focusValue.value = next
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
  focusValue.value = value.value
  lastInputRequest.value = undefined
  draft.value = value.value === null ? '' : editingFormatter.value.format(value.value)
  emit('focus', event)
}
function onBlur(event: FocusEvent) {
  focused.value = false
  commit()
  emit('blur', event)
}
let form: HTMLFormElement | null = null
function reset(event: Event) {
  queueMicrotask(async () => {
    if (event.defaultPrevented) return
    local.value = initialValue
    if (props.modelValue !== undefined) emit('update:modelValue', initialValue)
    await nextTick()
    draft.value = display(value.value)
    focusValue.value = value.value
    lastInputRequest.value = undefined
  })
}
onMounted(() => {
  form = input.value?.form ?? null
  form?.addEventListener('reset', reset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', reset))
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
  select: () => input.value?.select(),
})
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-number-input',
      { 'is-invalid': invalid, 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <span
      v-if="$slots.prefix"
      v-bind="ui?.prefix?.attrs"
      :class="['number-prefix', ui?.prefix?.class]"
      :style="ui?.prefix?.style"
      ><slot name="prefix" /></span
    ><input
      v-bind="{ ...ui?.control?.attrs, ...controlAttrs }"
      ref="input"
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
    /><span
      v-if="$slots.suffix"
      v-bind="ui?.suffix?.attrs"
      :class="['number-suffix', ui?.suffix?.class]"
      :style="ui?.suffix?.style"
      ><slot name="suffix" /></span
    ><span v-if="controls" class="number-steppers"
      ><button
        type="button"
        v-bind="ui?.stepper?.attrs"
        :class="ui?.stepper?.class"
        :style="ui?.stepper?.style"
        aria-label="Increase value"
        :disabled="disabled || readonly"
        @click="step('increment', $event)"
      >
        <slot name="increment-icon">+</slot></button
      ><button
        type="button"
        v-bind="ui?.stepper?.attrs"
        :class="ui?.stepper?.class"
        :style="ui?.stepper?.style"
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
  border: 0.0625rem solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
}
.aven-number-input:focus-within {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.0625rem;
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
  gap: 0.0625rem;
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
  outline: 0.125rem solid var(--aven-color-focus-ring);
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

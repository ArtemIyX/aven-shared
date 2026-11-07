<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { AvenSliderProps, AvenSliderEvents, AvenSliderSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSliderProps>(), {
  defaultValue: 0,
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
  inverted: false,
  disabled: false,
  readonly: false,
  unstyled: false,
})
const emit = defineEmits<AvenSliderEvents>()
defineSlots<AvenSliderSlots>()
const attrs = useAttrs()
const nativeAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const localValue = ref(props.defaultValue)
const input = ref<HTMLInputElement>()
const dragging = ref(false)
const focused = ref(false)
let form: HTMLFormElement | null = null
const value = computed(() => props.modelValue ?? localValue.value)
const percentage = computed(() =>
  props.max <= props.min ? 0 : ((value.value - props.min) / (props.max - props.min)) * 100,
)
const displayValue = computed(() => props.formatValue?.(value.value) ?? String(value.value))
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = next
  },
)
function update(next: number) {
  if (props.disabled || props.readonly) return
  const rounded = Math.min(props.max, Math.max(props.min, Number(next.toFixed(precision()))))
  localValue.value = rounded
  emit('update:modelValue', rounded)
}
function precision() {
  return Math.max(0, (String(props.step).split('.')[1] ?? '').length)
}
function markPercentage(mark: number) {
  return props.max <= props.min
    ? 0
    : Math.min(100, Math.max(0, ((mark - props.min) / (props.max - props.min)) * 100))
}
function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.readonly) target.value = String(value.value)
  else update(Number(target.value))
}
function onChange(event: Event) {
  const next = Number((event.target as HTMLInputElement).value)
  if (!props.disabled && !props.readonly) emit('change', next)
}
function startDrag(event: PointerEvent) {
  if (props.disabled || props.readonly || event.button !== 0 || dragging.value) return
  dragging.value = true
  emit('dragStart', { thumb: 0, value: value.value })
  document.addEventListener('pointerup', endDrag, { once: true })
  document.addEventListener('pointercancel', endDrag, { once: true })
}
function endDrag() {
  if (!dragging.value) return
  dragging.value = false
  document.removeEventListener('pointerup', endDrag)
  document.removeEventListener('pointercancel', endDrag)
  emit('dragEnd', { thumb: 0, value: value.value })
}
function readonlyKeydown(event: KeyboardEvent) {
  if (
    props.readonly &&
    [
      'ArrowDown',
      'ArrowUp',
      'ArrowLeft',
      'ArrowRight',
      'PageDown',
      'PageUp',
      'Home',
      'End',
    ].includes(event.key)
  )
    event.preventDefault()
}
function cleanup() {
  if (typeof document === 'undefined') return
  document.removeEventListener('pointerup', endDrag)
  document.removeEventListener('pointercancel', endDrag)
  dragging.value = false
}
function resetFromForm(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    const next = props.defaultValue ?? 0
    localValue.value = next
    if (props.modelValue !== undefined) emit('update:modelValue', next)
  })
}
onMounted(() => {
  input.value?.addEventListener('pointerdown', startDrag)
  form = input.value?.form ?? null
  form?.addEventListener('reset', resetFromForm)
})
onBeforeUnmount(() => {
  input.value?.removeEventListener('pointerdown', startDrag)
  form?.removeEventListener('reset', resetFromForm)
  cleanup()
})
defineExpose({ focus: () => input.value?.focus(), blur: () => input.value?.blur() })
</script>

<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-slider',
      `is-${orientation}`,
      {
        'is-disabled': disabled,
        'is-inverted': inverted,
        'is-unstyled': unstyled,
        'has-custom-thumb': !!$slots.thumb,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <slot name="leading" />
    <div class="slider-control">
      <div
        v-bind="ui?.track?.attrs"
        class="slider-track"
        :class="ui?.track?.class"
        :style="[ui?.track?.style, { '--aven-slider-value': `${percentage}%` }]"
        aria-hidden="true"
      >
        <span class="slider-fill" />
        <span
          v-if="$slots.thumb"
          v-bind="ui?.thumb?.attrs"
          :class="['slider-thumb-slot', ui?.thumb?.class]"
          :style="[
            { '--aven-thumb-position': `${inverted ? 100 - percentage : percentage}%` },
            ui?.thumb?.style,
          ]"
        >
          <slot name="thumb" :index="0" :value="value" :active="dragging || focused" />
        </span>
      </div>
      <input
        ref="input"
        v-bind="{ ...nativeAttrs, ...ui?.input?.attrs }"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value"
        :disabled="disabled"
        :readonly="readonly || undefined"
        :aria-readonly="readonly || undefined"
        :aria-label="
          label ||
          (typeof nativeAttrs['aria-label'] === 'string' ? nativeAttrs['aria-label'] : undefined)
        "
        :aria-valuetext="displayValue"
        :class="['slider-input', ui?.input?.class]"
        :style="ui?.input?.style"
        @input="onInput"
        @change="onChange"
        @keydown="readonlyKeydown"
        @focus="focused = true"
        @blur="focused = false"
      />
      <div v-if="marks?.length" class="slider-marks">
        <span
          v-bind="ui?.mark?.attrs"
          v-for="mark in marks"
          :key="mark.value"
          class="slider-mark"
          :class="ui?.mark?.class"
          :style="[
            {
              '--aven-mark-position': `${inverted ? 100 - markPercentage(mark.value) : markPercentage(mark.value)}%`,
            },
            ui?.mark?.style,
          ]"
          :aria-hidden="mark.label ? undefined : 'true'"
        >
          <span aria-hidden="true">•</span
          ><slot name="mark" :value="mark.value" :label="mark.label">{{ mark.label }}</slot>
        </span>
      </div>
      <slot name="value" :value="value" :index="0">{{ displayValue }}</slot>
    </div>
    <slot name="trailing" />
  </div>
</template>

<style scoped>
.aven-slider {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.slider-control {
  position: relative;
  display: flex;
  flex: 1;
  min-inline-size: 4rem;
  align-items: center;
  min-block-size: 2.75rem;
}
.slider-track {
  position: absolute;
  inset-inline: 0.5rem;
  block-size: 0.35rem;
  border-radius: 999px;
  background: var(--aven-color-border-subtle);
  pointer-events: none;
}
.slider-fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: var(--aven-slider-value);
  border-radius: inherit;
  background: var(--aven-color-accent-solid);
}
.slider-thumb-slot {
  position: absolute;
  inset-inline-start: var(--aven-thumb-position);
  inset-block-start: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
}
.aven-slider:dir(rtl) .slider-thumb-slot {
  transform: translate(50%, -50%);
}
.has-custom-thumb .slider-input::-webkit-slider-thumb {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}
.has-custom-thumb .slider-input::-moz-range-thumb {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}
.is-inverted .slider-fill {
  inset-inline-start: auto;
  inset-inline-end: 0;
}
.is-inverted .slider-input {
  transform: rotate(180deg);
}
.slider-input {
  position: relative;
  z-index: 1;
  inline-size: 100%;
  min-block-size: 2.75rem;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
  touch-action: none;
}
.slider-input::-webkit-slider-runnable-track {
  block-size: 0.35rem;
  background: transparent;
}
.slider-input::-moz-range-track {
  block-size: 0.35rem;
  background: transparent;
}
.slider-input::-webkit-slider-thumb {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  margin-block-start: -0.4rem;
  appearance: none;
  border: 2px solid var(--aven-color-accent-solid);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  box-shadow: 0 1px 3px var(--aven-color-shadow-ambient);
}
.slider-input::-moz-range-thumb {
  inline-size: 0.9rem;
  block-size: 0.9rem;
  border: 2px solid var(--aven-color-accent-solid);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  box-shadow: 0 1px 3px var(--aven-color-shadow-ambient);
}
.slider-input:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 3px;
  border-radius: 999px;
}
.slider-input:disabled {
  cursor: not-allowed;
}
.slider-marks {
  position: absolute;
  inset-inline: 0.5rem;
  inset-block-start: calc(100% - 0.4rem);
  display: flex;
  justify-content: space-between;
  font-size: var(--aven-font-size-xs);
  color: var(--aven-color-text-secondary);
}
.slider-mark {
  position: absolute;
  inset-inline-start: var(--aven-mark-position);
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  min-inline-size: 1.5rem;
}
.is-vertical {
  align-items: stretch;
  min-block-size: 10rem;
}
.is-vertical .slider-control {
  justify-content: center;
  min-block-size: 10rem;
}
.is-vertical .slider-track {
  inset-inline: auto;
  inset-block: 0.5rem;
  inline-size: 0.35rem;
}
.is-vertical .slider-fill {
  inset-block-start: auto;
  inset-inline: 0;
  inline-size: 100%;
  block-size: var(--aven-slider-value);
}
.is-vertical .slider-thumb-slot {
  inset-inline-start: 50%;
  inset-block-start: auto;
  inset-block-end: var(--aven-thumb-position);
  transform: translate(-50%, 50%);
}
.aven-slider.is-vertical:dir(rtl) .slider-thumb-slot {
  transform: translate(50%, 50%);
}
.is-vertical.is-inverted .slider-fill {
  inset-block-start: 0;
  inset-block-end: auto;
}
.is-vertical .slider-marks {
  inset-inline-start: calc(50% + 1.5rem);
  inset-inline-end: auto;
  inset-block: 0.5rem;
}
.is-vertical .slider-mark {
  inset-inline-start: 0;
  inset-block-end: var(--aven-mark-position);
  transform: translateY(50%);
}
.is-vertical .slider-input {
  inline-size: 2.75rem;
  block-size: 10rem;
  writing-mode: vertical-lr;
  direction: rtl;
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .slider-track {
  display: none;
}
@media (forced-colors: active) {
  .slider-track {
    border: 1px solid CanvasText;
  }
  .slider-fill {
    background: Highlight;
  }
  .slider-input::-webkit-slider-thumb,
  .slider-input::-moz-range-thumb {
    border-color: ButtonText;
  }
}
</style>

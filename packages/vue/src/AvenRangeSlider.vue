<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type { AvenRangeSliderEvents, AvenRangeSliderProps, AvenRangeSliderSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenRangeSliderProps>(), {
  defaultValue: () => [0, 100],
  min: 0,
  max: 100,
  step: 1,
  minGap: 0,
  orientation: 'horizontal',
  inverted: false,
  disabled: false,
  readonly: false,
  unstyled: false,
  startLabel: 'Minimum value',
  endLabel: 'Maximum value',
})
const emit = defineEmits<AvenRangeSliderEvents>()
defineSlots<AvenRangeSliderSlots>()
const attrs = useAttrs()
const nativeAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')),
)
const localValue = ref<[number, number]>([...props.defaultValue])
const inputs = ref<Array<HTMLInputElement | undefined>>([])
const activeThumb = ref<0 | 1 | null>(null)
let form: HTMLFormElement | null = null
const value = computed<[number, number]>(() => {
  const [rawLow, rawHigh] = props.modelValue ?? localValue.value
  const low = Math.min(props.max, Math.max(props.min, rawLow))
  const high = Math.max(low + safeGap.value, Math.min(props.max, Math.max(props.min, rawHigh)))
  return [
    Math.max(props.min, high > props.max ? props.max - safeGap.value : low),
    Math.min(props.max, high),
  ]
})
const safeGap = computed(() => Math.max(0, Math.min(props.minGap, props.max - props.min)))
const left = computed(() => percent(value.value[0]))
const width = computed(() => Math.max(0, percent(value.value[1]) - percent(value.value[0])))
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) localValue.value = [...next]
  },
)
function percent(current: number) {
  return props.max <= props.min ? 0 : ((current - props.min) / (props.max - props.min)) * 100
}
function precision() {
  return Math.max(0, (String(props.step).split('.')[1] ?? '').length)
}
function update(index: 0 | 1, next: number) {
  if (props.disabled || props.readonly) return
  const rounded = Number(next.toFixed(precision()))
  const [low, high] = value.value
  const adjusted: [number, number] =
    index === 0
      ? [Math.min(Math.max(props.min, Math.min(props.max, rounded)), high - safeGap.value), high]
      : [low, Math.max(Math.min(props.max, Math.max(props.min, rounded)), low + safeGap.value)]
  if (adjusted[index] === value.value[index]) return
  localValue.value = adjusted
  emit('update:modelValue', adjusted)
}
function onInput(index: 0 | 1, event: Event) {
  const target = event.target as HTMLInputElement
  if (props.readonly) target.value = String(value.value[index])
  else update(index, Number(target.value))
}
function onChange() {
  if (!props.disabled && !props.readonly) emit('change', [...value.value])
}
function startDrag(event: PointerEvent, index: 0 | 1) {
  if (props.disabled || props.readonly || event.button !== 0 || activeThumb.value !== null) return
  activeThumb.value = index
  emit('dragStart', { thumb: index, value: [...value.value] })
  document.addEventListener('pointerup', endDrag, { once: true })
  document.addEventListener('pointercancel', endDrag, { once: true })
}
function endDrag() {
  const index = activeThumb.value
  if (index === null) return
  activeThumb.value = null
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerup', endDrag)
    document.removeEventListener('pointercancel', endDrag)
  }
  emit('dragEnd', { thumb: index, value: [...value.value] })
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
function setInputRef(index: 0 | 1, element: unknown) {
  inputs.value[index] =
    element &&
    typeof element === 'object' &&
    'focus' in element &&
    typeof element.focus === 'function'
      ? (element as HTMLInputElement)
      : undefined
}
function resetFromForm(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return
    const next: [number, number] = [...(props.defaultValue ?? [props.min, props.max])]
    localValue.value = next
    if (props.modelValue !== undefined) emit('update:modelValue', next)
  })
}
onMounted(() => {
  form = inputs.value[0]?.form ?? null
  form?.addEventListener('reset', resetFromForm)
})
onBeforeUnmount(() => {
  form?.removeEventListener('reset', resetFromForm)
  if (typeof document !== 'undefined') {
    document.removeEventListener('pointerup', endDrag)
    document.removeEventListener('pointercancel', endDrag)
  }
})
defineExpose({
  focus: (index: 0 | 1 = 0) => inputs.value[index]?.focus(),
  blur: (index: 0 | 1 = 0) => inputs.value[index]?.blur(),
})
</script>

<template>
  <div
    v-bind="ui?.root?.attrs"
    role="group"
    :aria-label="label || undefined"
    :class="[
      'aven-range-slider',
      `is-${orientation}`,
      { 'is-disabled': disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <slot name="leading" />
    <div class="slider-control">
      <div
        class="slider-track"
        :class="ui?.track?.class"
        :style="[
          ui?.track?.style,
          {
            '--aven-range-start': `${inverted ? 100 - left - width : left}%`,
            '--aven-range-width': `${width}%`,
          },
        ]"
        aria-hidden="true"
      >
        <span class="slider-fill" />
      </div>
      <input
        :ref="(element) => setInputRef(0, element)"
        v-bind="{ ...nativeAttrs, ...ui?.input?.attrs }"
        :id="nativeAttrs.id ? `${nativeAttrs.id}-start` : undefined"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value[0]"
        :disabled="disabled"
        :aria-readonly="readonly || undefined"
        :aria-label="startLabel"
        :aria-valuetext="formatValue?.(value[0], 0) ?? String(value[0])"
        :class="['slider-input', 'slider-start', ui?.input?.class]"
        :style="ui?.input?.style"
        @input="onInput(0, $event)"
        @change="onChange"
        @pointerdown="startDrag($event, 0)"
        @keydown="readonlyKeydown"
      />
      <input
        :ref="(element) => setInputRef(1, element)"
        v-bind="{ ...nativeAttrs, ...ui?.input?.attrs }"
        :id="nativeAttrs.id ? `${nativeAttrs.id}-end` : undefined"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value[1]"
        :disabled="disabled"
        :aria-readonly="readonly || undefined"
        :aria-label="endLabel"
        :aria-valuetext="formatValue?.(value[1], 1) ?? String(value[1])"
        :class="['slider-input', 'slider-end', ui?.input?.class]"
        :style="ui?.input?.style"
        @input="onInput(1, $event)"
        @change="onChange"
        @pointerdown="startDrag($event, 1)"
        @keydown="readonlyKeydown"
      />
      <div v-if="marks?.length" class="slider-marks">
        <span
          v-for="mark in marks"
          :key="mark.value"
          class="slider-mark"
          :class="ui?.mark?.class"
          :style="ui?.mark?.style"
          ><span aria-hidden="true">•</span
          ><slot name="mark" :value="mark.value" :label="mark.label">{{ mark.label }}</slot></span
        >
      </div>
      <div v-if="$slots.value" class="slider-values">
        <span
          ><slot name="value" :value="value[0]" :index="0">{{
            formatValue?.(value[0], 0) ?? value[0]
          }}</slot></span
        ><span
          ><slot name="value" :value="value[1]" :index="1">{{
            formatValue?.(value[1], 1) ?? value[1]
          }}</slot></span
        >
      </div>
    </div>
    <slot name="trailing" />
  </div>
</template>

<style scoped>
.aven-range-slider {
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
  inset-inline-start: var(--aven-range-start);
  inline-size: var(--aven-range-width);
  border-radius: inherit;
  background: var(--aven-color-accent-solid);
}
.slider-input {
  position: absolute;
  z-index: 1;
  inset-inline: 0;
  inline-size: 100%;
  min-block-size: 2.75rem;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
  touch-action: none;
  pointer-events: none;
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
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  pointer-events: auto;
}
.slider-input::-moz-range-thumb {
  inline-size: 0.9rem;
  block-size: 0.9rem;
  border: 2px solid var(--aven-color-accent-solid);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
  pointer-events: auto;
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
  display: grid;
  justify-items: center;
  min-inline-size: 1.5rem;
}
.slider-values {
  display: flex;
  justify-content: space-between;
  gap: var(--aven-space-3);
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
  block-size: var(--aven-range-width);
}
.is-vertical .slider-input {
  inset-inline: auto;
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

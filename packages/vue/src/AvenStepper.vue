<script setup lang="ts" generic="Key extends string | number = string | number">
import { computed, ref, useAttrs } from 'vue'
import type { AvenStepperEvents, AvenStepperProps, AvenStepperSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenStepperProps<Key>>(), {
  linear: true,
  orientation: 'horizontal',
  clickable: false,
  label: 'Progress',
  unstyled: false,
})
const emit = defineEmits<AvenStepperEvents<Key>>()
defineSlots<AvenStepperSlots<Key>>()
const attrs = useAttrs()
const localValue = ref<Key | undefined>(props.defaultValue)
const currentValue = computed(
  () => props.modelValue ?? localValue.value ?? props.items.find((item) => !item.disabled)?.key,
)
const currentIndex = computed(() =>
  props.items.findIndex((item) => item.key === currentValue.value),
)

function statusFor(index: number) {
  const item = props.items[index]
  return item.status ?? (index < currentIndex.value ? 'complete' : 'incomplete')
}
function scopeFor(index: number) {
  const item = props.items[index]!
  return {
    item,
    index,
    current: item.key === currentValue.value,
    completed: statusFor(index) === 'complete',
  }
}
function canRequest(index: number) {
  const item = props.items[index]
  if (!props.clickable || !item || item.disabled || item.key === currentValue.value) return false
  if (currentIndex.value < 0) return index === 0
  return (
    !props.linear ||
    index < currentIndex.value ||
    (index === currentIndex.value + 1 && statusFor(currentIndex.value) === 'complete')
  )
}
function requestStep(index: number, originalEvent: MouseEvent) {
  const item = props.items[index]
  if (!item || !canRequest(index)) return
  emit('requestStep', { key: item.key, from: currentValue.value, originalEvent })
  if (props.modelValue === undefined) localValue.value = item.key
  emit('update:modelValue', item.key)
}
</script>

<template>
  <nav
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :aria-label="props.label"
    :class="[
      'aven-stepper',
      `is-${props.orientation}`,
      { 'is-clickable': props.clickable, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <ol
      v-bind="props.ui?.list?.attrs"
      :class="['stepper-list', props.ui?.list?.class]"
      :style="props.ui?.list?.style"
    >
      <li
        v-bind="props.ui?.step?.attrs"
        v-for="(item, index) in props.items"
        :key="item.key"
        :class="[
          'stepper-step',
          `is-${statusFor(index)}`,
          { 'is-current': item.key === currentValue, 'is-disabled': item.disabled },
          props.ui?.step?.class,
        ]"
        :style="props.ui?.step?.style"
      >
        <button
          v-if="props.clickable"
          type="button"
          class="stepper-step-button"
          :disabled="item.disabled || !canRequest(index)"
          :aria-current="item.key === currentValue ? 'step' : undefined"
          @click="requestStep(index, $event)"
        >
          <slot name="step" v-bind="scopeFor(index)">
            <span
              v-bind="props.ui?.indicator?.attrs"
              :class="['stepper-indicator', props.ui?.indicator?.class]"
              :style="props.ui?.indicator?.style"
            >
              <slot name="indicator" v-bind="scopeFor(index)">
                <span v-if="statusFor(index) === 'complete'" aria-hidden="true">✓</span>
                <span v-else-if="statusFor(index) === 'error'" aria-hidden="true">!</span>
                <span v-else>{{ index + 1 }}</span>
              </slot>
            </span>
            <span class="stepper-copy">
              <span
                v-bind="props.ui?.label?.attrs"
                :class="['stepper-label', props.ui?.label?.class]"
                :style="props.ui?.label?.style"
              >
                <slot name="label" v-bind="scopeFor(index)">{{ item.label }}</slot>
              </span>
              <span
                v-bind="props.ui?.description?.attrs"
                v-if="item.description || $slots.description"
                :class="['stepper-description', props.ui?.description?.class]"
                :style="props.ui?.description?.style"
              >
                <slot name="description" v-bind="scopeFor(index)">{{ item.description }}</slot>
              </span>
              <span v-if="statusFor(index) === 'error'" class="stepper-status">Error</span>
            </span>
          </slot>
        </button>
        <div
          v-else
          class="stepper-step-content"
          :aria-current="item.key === currentValue ? 'step' : undefined"
        >
          <slot name="step" v-bind="scopeFor(index)">
            <span
              v-bind="props.ui?.indicator?.attrs"
              :class="['stepper-indicator', props.ui?.indicator?.class]"
              :style="props.ui?.indicator?.style"
            >
              <slot name="indicator" v-bind="scopeFor(index)">
                <span v-if="statusFor(index) === 'complete'" aria-hidden="true">✓</span>
                <span v-else-if="statusFor(index) === 'error'" aria-hidden="true">!</span>
                <span v-else>{{ index + 1 }}</span>
              </slot>
            </span>
            <span class="stepper-copy">
              <span
                v-bind="props.ui?.label?.attrs"
                :class="['stepper-label', props.ui?.label?.class]"
                :style="props.ui?.label?.style"
              >
                <slot name="label" v-bind="scopeFor(index)">{{ item.label }}</slot>
              </span>
              <span
                v-bind="props.ui?.description?.attrs"
                v-if="item.description || $slots.description"
                :class="['stepper-description', props.ui?.description?.class]"
                :style="props.ui?.description?.style"
              >
                <slot name="description" v-bind="scopeFor(index)">{{ item.description }}</slot>
              </span>
              <span v-if="statusFor(index) === 'error'" class="stepper-status">Error</span>
            </span>
          </slot>
        </div>
        <span
          v-bind="props.ui?.connector?.attrs"
          v-if="index < props.items.length - 1"
          :class="['stepper-connector', props.ui?.connector?.class]"
          :style="props.ui?.connector?.style"
          aria-hidden="true"
        >
          <slot name="connector" :index="index" />
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.aven-stepper {
  --aven-stepper-color: var(--aven-color-text-secondary);
  --aven-stepper-active: var(--aven-color-accent-solid);
  --aven-stepper-complete: var(--aven-color-success-solid);
  --aven-stepper-error: var(--aven-color-danger-solid);
  --aven-stepper-line: var(--aven-color-border-subtle);
  color: var(--aven-color-text-primary);
  min-inline-size: 0;
}
.stepper-list {
  display: flex;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.is-vertical .stepper-list {
  flex-direction: column;
}
.stepper-step {
  position: relative;
  display: flex;
  flex: 1 1 0;
  min-inline-size: 0;
}
.stepper-step-button,
.stepper-step-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  padding: var(--aven-space-2);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  font: inherit;
}
.stepper-step-button {
  cursor: pointer;
}
.stepper-step-button:disabled {
  cursor: default;
}
.stepper-step-button:not(:disabled):focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
  border-radius: var(--aven-radius-sm);
}
.stepper-indicator {
  display: inline-grid;
  flex: 0 0 2rem;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border: 0.0625rem solid var(--aven-stepper-line);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  color: var(--aven-stepper-color);
  font-size: var(--aven-font-size-sm);
  font-weight: var(--aven-font-weight-semibold);
}
.stepper-copy {
  display: grid;
  gap: var(--aven-space-1);
  min-inline-size: 0;
}
.stepper-label {
  font-size: var(--aven-font-size-sm);
  font-weight: var(--aven-font-weight-semibold);
  overflow-wrap: anywhere;
}
.stepper-description,
.stepper-status {
  color: var(--aven-stepper-color);
  font-size: var(--aven-font-size-xs);
  overflow-wrap: anywhere;
}
.stepper-status {
  color: var(--aven-stepper-error);
  font-weight: var(--aven-font-weight-semibold);
}
.is-current .stepper-indicator {
  border-color: var(--aven-stepper-active);
  background: var(--aven-stepper-active);
  color: var(--aven-color-accent-on-solid);
}
.is-complete .stepper-indicator {
  border-color: var(--aven-stepper-complete);
  background: var(--aven-stepper-complete);
  color: var(--aven-color-success-on-solid);
}
.is-error .stepper-indicator {
  border-color: var(--aven-stepper-error);
  color: var(--aven-stepper-error);
}
.stepper-connector {
  position: absolute;
  inset-inline-start: calc(var(--aven-space-2) + 2rem);
  inset-inline-end: 0;
  inset-block-start: 1rem;
  border-block-start: 0.0625rem solid var(--aven-stepper-line);
}
.is-vertical .stepper-step {
  min-block-size: 3.5rem;
}
.is-vertical .stepper-connector {
  inset-inline-start: 1rem;
  inset-inline-end: auto;
  inset-block-start: 3rem;
  inset-block-end: 0;
  border-block-start: 0;
  border-inline-start: 0.0625rem solid var(--aven-stepper-line);
}
.is-unstyled .stepper-indicator {
  border-color: currentColor;
  background: transparent;
  color: inherit;
}
.is-unstyled .stepper-connector {
  border-color: currentColor;
  opacity: 0.35;
}
@media (max-width: 40rem) {
  .is-horizontal .stepper-list {
    flex-direction: column;
    gap: var(--aven-space-2);
  }
  .is-horizontal .stepper-step {
    min-block-size: 3.25rem;
  }
  .is-horizontal .stepper-connector {
    inset-inline-start: 1rem;
    inset-inline-end: auto;
    inset-block-start: 3rem;
    inset-block-end: 0;
    border-block-start: 0;
    border-inline-start: 0.0625rem solid var(--aven-stepper-line);
  }
}
@media (forced-colors: active) {
  .stepper-indicator {
    border-color: CanvasText;
    color: CanvasText;
  }
  .is-current .stepper-indicator {
    background: Highlight;
    color: HighlightText;
  }
  .stepper-connector {
    border-color: CanvasText;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
@media print {
  .aven-stepper,
  .stepper-step-button,
  .stepper-step-content {
    color: #000;
  }
  .stepper-indicator {
    border-color: #000;
    background: transparent;
    color: #000;
  }
  .stepper-connector {
    border-color: #777;
  }
}
</style>

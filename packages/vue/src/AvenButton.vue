<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'
import type { AvenButtonEvents, AvenButtonProps, AvenButtonSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenButtonProps>(), {
  variant: 'solid',
  tone: 'accent',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  loadingBehavior: 'block',
  block: false,
  shape: 'rounded',
  unstyled: false,
})
const emit = defineEmits<AvenButtonEvents>()
defineSlots<AvenButtonSlots>()
const attrs = useAttrs()
const buttonElement = ref<HTMLButtonElement | null>(null)
const blocked = computed(
  () => props.disabled || (props.loading && props.loadingBehavior === 'block'),
)
function onClick(event: MouseEvent) {
  if (blocked.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
defineExpose({
  focus: () => buttonElement.value?.focus(),
  blur: () => buttonElement.value?.blur(),
})
</script>
<template>
  <button
    ref="buttonElement"
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :type="type"
    :disabled="blocked"
    :aria-busy="loading || undefined"
    :class="[
      'aven-button',
      `is-${variant}`,
      `tone-${tone}`,
      `size-${size}`,
      `shape-${shape}`,
      { 'is-block': block, 'is-loading': loading, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    @click="onClick"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <span
      v-if="$slots.leading"
      v-bind="ui?.leading?.attrs"
      :class="['button-leading', ui?.leading?.class]"
      :style="ui?.leading?.style"
    >
      <slot name="leading" :disabled="blocked" :loading="loading" />
    </span>
    <span
      v-bind="ui?.label?.attrs"
      :class="['button-label', ui?.label?.class]"
      :style="ui?.label?.style"
    >
      <slot />
    </span>
    <span
      v-if="loading"
      v-bind="ui?.spinner?.attrs"
      aria-hidden="true"
      :class="['button-spinner', ui?.spinner?.class]"
      :style="ui?.spinner?.style"
    >
      <slot name="loading" :loading="loading">
        <span class="spinner" />
      </slot>
    </span>
    <span
      v-if="$slots.trailing"
      v-bind="ui?.trailing?.attrs"
      :class="['button-trailing', ui?.trailing?.class]"
      :style="ui?.trailing?.style"
    >
      <slot name="trailing" :disabled="blocked" :loading="loading" />
    </span>
  </button>
</template>
<style scoped>
.aven-button {
  --button-bg: var(--aven-color-accent-solid);
  --button-fg: var(--aven-color-accent-on-solid);
  --button-hover: var(--aven-color-accent-hover);
  --button-pressed: var(--aven-color-accent-pressed);
  --button-text: var(--aven-color-accent-text);
  --button-soft-bg: var(--aven-color-accent-subtle);
  --button-soft-border: var(--aven-color-accent-border);
  --button-outline-border: var(--aven-color-accent-border);
  --button-default-bg: var(--button-bg);
  --button-default-fg: var(--button-fg);
  --button-default-border: transparent;
  --button-default-hover-bg: var(--button-hover);
  --button-default-pressed-bg: var(--button-pressed);
  --button-default-radius: var(--aven-radius-md);
  --button-default-padding-inline: var(--aven-space-4);
  --button-default-min-block-size: 2.75rem;
  --button-default-gap: var(--aven-space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--aven-button-gap, var(--button-default-gap));
  min-inline-size: 2.75rem;
  min-block-size: var(--aven-button-min-block-size, var(--button-default-min-block-size));
  padding-inline: var(--aven-button-padding-inline, var(--button-default-padding-inline));
  border: 1px solid var(--aven-button-border, var(--button-default-border));
  border-radius: var(--aven-button-radius, var(--button-default-radius));
  font: inherit;
  font-weight: 600;
  color: var(--aven-button-fg, var(--button-default-fg));
  background: var(--aven-button-bg, var(--button-default-bg));
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}
.tone-neutral {
  --button-bg: var(--aven-color-neutral-solid);
  --button-fg: var(--aven-color-neutral-on-solid);
  --button-hover: var(--aven-color-neutral-hover);
  --button-pressed: var(--aven-color-neutral-pressed);
  --button-text: var(--aven-color-neutral-text);
  --button-soft-bg: var(--aven-color-neutral-subtle);
  --button-soft-border: var(--aven-color-neutral-border);
  --button-outline-border: var(--aven-color-neutral-border);
}
.tone-secondary {
  --button-bg: var(--aven-color-secondary-solid);
  --button-fg: var(--aven-color-secondary-on-solid);
  --button-hover: var(--aven-color-secondary-hover);
  --button-pressed: var(--aven-color-secondary-pressed);
  --button-text: var(--aven-color-secondary-text);
  --button-soft-bg: var(--aven-color-secondary-subtle);
  --button-soft-border: var(--aven-color-secondary-border);
  --button-outline-border: var(--aven-color-secondary-border);
}
.tone-info {
  --button-bg: var(--aven-color-info-solid);
  --button-fg: var(--aven-color-info-on-solid);
  --button-hover: var(--aven-color-info-hover);
  --button-pressed: var(--aven-color-info-pressed);
  --button-text: var(--aven-color-info-text);
  --button-soft-bg: var(--aven-color-info-subtle);
  --button-soft-border: var(--aven-color-info-border);
  --button-outline-border: var(--aven-color-info-border);
}
.tone-success {
  --button-bg: var(--aven-color-success-solid);
  --button-fg: var(--aven-color-success-on-solid);
  --button-hover: var(--aven-color-success-hover);
  --button-pressed: var(--aven-color-success-pressed);
  --button-text: var(--aven-color-success-text);
  --button-soft-bg: var(--aven-color-success-subtle);
  --button-soft-border: var(--aven-color-success-border);
  --button-outline-border: var(--aven-color-success-border);
}
.tone-warning {
  --button-bg: var(--aven-color-warning-solid);
  --button-fg: var(--aven-color-warning-on-solid);
  --button-hover: var(--aven-color-warning-hover);
  --button-pressed: var(--aven-color-warning-pressed);
  --button-text: var(--aven-color-warning-text);
  --button-soft-bg: var(--aven-color-warning-subtle);
  --button-soft-border: var(--aven-color-warning-border);
  --button-outline-border: var(--aven-color-warning-border);
}
.tone-danger {
  --button-bg: var(--aven-color-danger-solid);
  --button-fg: var(--aven-color-danger-on-solid);
  --button-hover: var(--aven-color-danger-hover);
  --button-pressed: var(--aven-color-danger-pressed);
  --button-text: var(--aven-color-danger-text);
  --button-soft-bg: var(--aven-color-danger-subtle);
  --button-soft-border: var(--aven-color-danger-border);
  --button-outline-border: var(--aven-color-danger-border);
}
.tone-critical {
  --button-bg: var(--aven-color-critical-solid);
  --button-fg: var(--aven-color-critical-on-solid);
  --button-hover: var(--aven-color-critical-hover);
  --button-pressed: var(--aven-color-critical-pressed);
  --button-text: var(--aven-color-critical-text);
  --button-soft-bg: var(--aven-color-critical-subtle);
  --button-soft-border: var(--aven-color-critical-border);
  --button-outline-border: var(--aven-color-critical-border);
}
.is-soft {
  --button-default-bg: var(--button-soft-bg);
  --button-default-fg: var(--button-text);
  --button-default-border: var(--button-soft-border);
  --button-default-hover-bg: var(--button-soft-bg);
  --button-default-pressed-bg: var(--button-soft-bg);
}
.is-outline {
  --button-default-bg: var(--aven-color-surface-base);
  --button-default-fg: var(--button-text);
  --button-default-border: var(--button-outline-border);
  --button-default-hover-bg: var(--button-soft-bg);
  --button-default-pressed-bg: var(--button-soft-bg);
}
.is-ghost,
.is-link {
  --button-default-bg: transparent;
  --button-default-fg: var(--button-text);
  --button-default-hover-bg: var(--button-soft-bg);
  --button-default-pressed-bg: var(--button-soft-bg);
}
.is-link {
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.size-xs {
  --button-default-min-block-size: 2.75rem;
  --button-default-padding-inline: var(--aven-space-2);
  font-size: var(--aven-font-size-xs);
}
.size-sm {
  --button-default-min-block-size: 2.75rem;
  --button-default-padding-inline: var(--aven-space-3);
  font-size: var(--aven-font-size-sm);
}
.size-md {
  --button-default-min-block-size: 2.75rem;
}
.size-lg {
  --button-default-min-block-size: 3rem;
  --button-default-padding-inline: var(--aven-space-6);
}
.shape-pill {
  --button-default-radius: 999px;
}
.shape-square {
  --button-default-radius: 0;
}
.is-block {
  display: flex;
  inline-size: 100%;
}
.aven-button:not(:disabled):hover {
  background: var(--aven-button-hover-bg, var(--button-default-hover-bg));
}
.aven-button:not(:disabled):active {
  background: var(--aven-button-pressed-bg, var(--button-default-pressed-bg));
}
.aven-button:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.aven-button:disabled {
  border-color: var(--aven-color-border-subtle);
  color: var(--aven-color-text-disabled);
  background: var(--aven-color-surface-disabled);
  cursor: not-allowed;
}
.aven-button.is-unstyled {
  appearance: none;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  padding: var(--aven-space-2);
  font-weight: inherit;
}
.aven-button.is-unstyled:not(:disabled):hover,
.aven-button.is-unstyled:not(:disabled):active {
  background: transparent;
}
.button-label {
  min-inline-size: 0;
}
.button-leading,
.button-trailing,
.button-spinner {
  display: inline-flex;
  align-items: center;
  flex: none;
}
.spinner {
  inline-size: 1em;
  block-size: 1em;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
@media (prefers-reduced-motion: reduce) {
  .aven-button,
  .spinner {
    transition: none;
    animation: none;
  }
}
@media (forced-colors: active) {
  .aven-button {
    border: 1px solid ButtonText;
  }
}
</style>

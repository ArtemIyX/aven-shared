<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { AvenBadgeProps, AvenBadgeSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenBadgeProps>(), {
  tone: 'neutral',
  variant: 'soft',
  size: 'sm',
  max: 99,
  showZero: false,
  unstyled: false,
})
defineSlots<AvenBadgeSlots>()
const attrs = useAttrs()
const visibleCount = computed(() =>
  props.count === undefined
    ? undefined
    : props.count > props.max
      ? `${props.max}+`
      : String(props.count),
)
const visible = computed(() => props.count === undefined || props.count > 0 || props.showZero)
const accessibleLabel = computed(() =>
  props.count === undefined
    ? props.label
    : props.label
      ? `${props.count} ${props.label}`
      : String(props.count),
)
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>

<template>
  <span
    v-bind="{ ...ui?.root?.attrs, ...forwardedAttrs }"
    v-if="visible"
    :class="[
      'aven-badge',
      `tone-${tone}`,
      `size-${size}`,
      `is-${variant}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <span
      v-if="variant === 'dot'"
      v-bind="ui?.dot?.attrs"
      aria-hidden="true"
      :class="['badge-dot', ui?.dot?.class]"
      :style="ui?.dot?.style"
    />
    <span
      v-if="$slots.leading"
      v-bind="ui?.leading?.attrs"
      :class="['badge-leading', ui?.leading?.class]"
      :style="ui?.leading?.style"
      ><slot name="leading"
    /></span>
    <span
      :aria-hidden="
        (count !== undefined && (label !== undefined || count > max)) ||
        (count === undefined && label !== undefined) ||
        undefined
      "
      ><slot>{{ visibleCount }}</slot></span
    >
    <span
      v-if="
        (count !== undefined && (label !== undefined || count > max)) ||
        (count === undefined && label !== undefined)
      "
      class="sr-only"
      >{{ accessibleLabel ?? String(count) }}</span
    >
    <span
      v-if="$slots.trailing"
      v-bind="ui?.trailing?.attrs"
      :class="['badge-trailing', ui?.trailing?.class]"
      :style="ui?.trailing?.style"
      ><slot name="trailing"
    /></span>
  </span>
</template>

<style scoped>
.aven-badge {
  --badge-default-bg: var(--tone-subtle);
  --badge-default-fg: var(--tone-text);
  --badge-default-border: transparent;
  --badge-default-radius: 999px;
  --badge-default-dot-size: 0.5em;
  display: inline-flex;
  align-items: center;
  gap: var(--aven-badge-gap, 0.3em);
  max-inline-size: 100%;
  border: 1px solid var(--aven-badge-border, var(--badge-default-border));
  border-radius: var(--aven-badge-radius, var(--badge-default-radius));
  padding: var(--aven-badge-padding, 0.125rem 0.5rem);
  color: var(--aven-badge-fg, var(--badge-default-fg));
  background: var(--aven-badge-bg, var(--badge-default-bg));
  font-size: var(--aven-font-size-sm);
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}
.size-xs {
  font-size: var(--aven-font-size-xs);
  padding: 0.0625rem 0.375rem;
}
.size-md {
  font-size: var(--aven-font-size-md);
  padding: 0.1875rem 0.625rem;
}
.tone-neutral {
  --tone-text: var(--aven-color-neutral-text);
  --tone-subtle: var(--aven-color-neutral-subtle);
  --tone-border: var(--aven-color-neutral-border);
  --tone-solid: var(--aven-color-neutral-solid);
  --tone-on-solid: var(--aven-color-neutral-on-solid);
}
.tone-accent {
  --tone-text: var(--aven-color-accent-text);
  --tone-subtle: var(--aven-color-accent-subtle);
  --tone-border: var(--aven-color-accent-border);
  --tone-solid: var(--aven-color-accent-solid);
  --tone-on-solid: var(--aven-color-accent-on-solid);
}
.tone-secondary {
  --tone-text: var(--aven-color-secondary-text);
  --tone-subtle: var(--aven-color-secondary-subtle);
  --tone-border: var(--aven-color-secondary-border);
  --tone-solid: var(--aven-color-secondary-solid);
  --tone-on-solid: var(--aven-color-secondary-on-solid);
}
.tone-info {
  --tone-text: var(--aven-color-info-text);
  --tone-subtle: var(--aven-color-info-subtle);
  --tone-border: var(--aven-color-info-border);
  --tone-solid: var(--aven-color-info-solid);
  --tone-on-solid: var(--aven-color-info-on-solid);
}
.tone-success {
  --tone-text: var(--aven-color-success-text);
  --tone-subtle: var(--aven-color-success-subtle);
  --tone-border: var(--aven-color-success-border);
  --tone-solid: var(--aven-color-success-solid);
  --tone-on-solid: var(--aven-color-success-on-solid);
}
.tone-warning {
  --tone-text: var(--aven-color-warning-text);
  --tone-subtle: var(--aven-color-warning-subtle);
  --tone-border: var(--aven-color-warning-border);
  --tone-solid: var(--aven-color-warning-solid);
  --tone-on-solid: var(--aven-color-warning-on-solid);
}
.tone-danger {
  --tone-text: var(--aven-color-danger-text);
  --tone-subtle: var(--aven-color-danger-subtle);
  --tone-border: var(--aven-color-danger-border);
  --tone-solid: var(--aven-color-danger-solid);
  --tone-on-solid: var(--aven-color-danger-on-solid);
}
.tone-critical {
  --tone-text: var(--aven-color-critical-text);
  --tone-subtle: var(--aven-color-critical-subtle);
  --tone-border: var(--aven-color-critical-border);
  --tone-solid: var(--aven-color-critical-solid);
  --tone-on-solid: var(--aven-color-critical-on-solid);
}
.is-outline {
  --badge-default-bg: transparent;
  --badge-default-border: var(--tone-border);
}
.is-solid {
  --badge-default-bg: var(--tone-solid);
  --badge-default-fg: var(--tone-on-solid);
}
.badge-dot {
  inline-size: var(--aven-badge-dot-size, var(--badge-default-dot-size));
  block-size: var(--aven-badge-dot-size, var(--badge-default-dot-size));
  flex: none;
  border-radius: 50%;
  background: var(--tone-solid);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: none;
  color: inherit;
}
.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

<script setup lang="ts" generic="T extends string | number = string | number">
import { toRefs, useAttrs } from 'vue'
import type { AvenChipEvents, AvenChipProps, AvenChipSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenChipProps<T>>(), {
  selected: false,
  removable: false,
  disabled: false,
  interactive: false,
  removeLabel: 'Remove',
  variant: 'soft',
  tone: 'neutral',
  size: 'sm',
  unstyled: false,
})
const {
  value,
  selected,
  removable,
  disabled,
  interactive,
  removeLabel,
  variant,
  tone,
  size,
  unstyled,
  ui,
} = toRefs(props)
const attrs = useAttrs()
const emit = defineEmits<AvenChipEvents<T>>()
defineSlots<AvenChipSlots>()
function requestRemove(originalEvent: MouseEvent) {
  emit('remove', { value: props.value, originalEvent })
}
</script>
<template>
  <span
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :class="[
      'aven-chip',
      `tone-${tone}`,
      `size-${size}`,
      `is-${variant}`,
      {
        'is-selected': selected,
        'is-disabled': disabled,
        'is-interactive': interactive,
        'is-unstyled': unstyled,
      },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    ><button
      v-if="interactive"
      type="button"
      :disabled="disabled"
      :aria-pressed="selected"
      :class="['chip-main', ui?.content?.class]"
      :style="ui?.content?.style"
      @click="emit('click', $event)"
    >
      <span v-if="$slots.leading" :class="ui?.leading?.class"><slot name="leading" /></span
      ><slot /><span v-if="$slots.trailing" :class="ui?.trailing?.class"
        ><slot name="trailing"
      /></span></button
    ><span v-else :class="['chip-main', ui?.content?.class]" :style="ui?.content?.style"
      ><span v-if="$slots.leading" :class="ui?.leading?.class"><slot name="leading" /></span
      ><slot /><span v-if="$slots.trailing" :class="ui?.trailing?.class"
        ><slot name="trailing" /></span></span
    ><button
      v-if="removable"
      type="button"
      :disabled="disabled"
      :aria-label="`${removeLabel} ${$slots.default ? 'item' : ''}`.trim()"
      :class="['chip-remove', ui?.remove?.class]"
      :style="ui?.remove?.style"
      @click="requestRemove($event)"
    >
      <slot name="remove-icon">×</slot>
    </button></span
  >
</template>
<style scoped>
.aven-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  max-inline-size: 100%;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--tone-text);
  background: var(--tone-bg);
  font-size: var(--aven-font-size-sm);
  line-height: 1.3;
  overflow: hidden;
}
.tone-neutral {
  --tone-text: var(--aven-color-neutral-text);
  --tone-bg: var(--aven-color-neutral-subtle);
  --tone-border: var(--aven-color-neutral-border);
  --tone-solid: var(--aven-color-neutral-solid);
  --tone-on: var(--aven-color-neutral-on-solid);
}
.tone-accent {
  --tone-text: var(--aven-color-accent-text);
  --tone-bg: var(--aven-color-accent-subtle);
  --tone-border: var(--aven-color-accent-border);
  --tone-solid: var(--aven-color-accent-solid);
  --tone-on: var(--aven-color-accent-on-solid);
}
.tone-secondary {
  --tone-text: var(--aven-color-secondary-text);
  --tone-bg: var(--aven-color-secondary-subtle);
  --tone-border: var(--aven-color-secondary-border);
  --tone-solid: var(--aven-color-secondary-solid);
  --tone-on: var(--aven-color-secondary-on-solid);
}
.tone-success {
  --tone-text: var(--aven-color-success-text);
  --tone-bg: var(--aven-color-success-subtle);
  --tone-border: var(--aven-color-success-border);
  --tone-solid: var(--aven-color-success-solid);
  --tone-on: var(--aven-color-success-on-solid);
}
.tone-warning {
  --tone-text: var(--aven-color-warning-text);
  --tone-bg: var(--aven-color-warning-subtle);
  --tone-border: var(--aven-color-warning-border);
  --tone-solid: var(--aven-color-warning-solid);
  --tone-on: var(--aven-color-warning-on-solid);
}
.tone-danger,
.tone-critical {
  --tone-text: var(--aven-color-danger-text);
  --tone-bg: var(--aven-color-danger-subtle);
  --tone-border: var(--aven-color-danger-border);
  --tone-solid: var(--aven-color-danger-solid);
  --tone-on: var(--aven-color-danger-on-solid);
}
.is-outline {
  background: transparent;
  border-color: var(--tone-border);
}
.is-solid {
  background: var(--tone-solid);
  color: var(--tone-on);
}
.size-xs {
  font-size: var(--aven-font-size-xs);
}
.size-lg {
  font-size: var(--aven-font-size-md);
}
.chip-main {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-inline-size: 0;
  padding: 0.2rem 0.55rem;
  color: inherit;
  font: inherit;
  line-height: inherit;
  overflow-wrap: anywhere;
}
.is-interactive .chip-main {
  border: 0;
  background: transparent;
  cursor: pointer;
}
.chip-main:focus-visible,
.chip-remove:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.chip-remove {
  display: inline-grid;
  place-items: center;
  align-self: stretch;
  min-inline-size: 1.75rem;
  padding: 0 0.25rem;
  border: 0;
  border-inline-start: 1px solid color-mix(in srgb, var(--tone-border), transparent 55%);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.chip-remove:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>

<script setup lang="ts">
import { toRefs, useAttrs } from 'vue'
import type { AvenTagProps, AvenTagSlots } from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTagProps>(), {
  tone: 'neutral',
  variant: 'soft',
  size: 'sm',
  unstyled: false,
})
const { tone, variant, size, unstyled, ui } = toRefs(props)
const attrs = useAttrs()
defineSlots<AvenTagSlots>()
</script>
<template>
  <span
    v-bind="{ ...attrs, ...ui?.root?.attrs }"
    :class="[
      'aven-tag',
      `tone-${tone}`,
      `size-${size}`,
      `is-${variant}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
    ><span
      v-if="$slots.leading"
      v-bind="ui?.leading?.attrs"
      :class="ui?.leading?.class"
      :style="ui?.leading?.style"
      ><slot name="leading" /></span
    ><slot /><span
      v-if="$slots.trailing"
      v-bind="ui?.trailing?.attrs"
      :class="ui?.trailing?.class"
      :style="ui?.trailing?.style"
      ><slot name="trailing" /></span
  ></span>
</template>
<style scoped>
.aven-tag {
  --tag-default-bg: var(--bg);
  --tag-default-fg: var(--text);
  --tag-default-border: transparent;
  display: inline-flex;
  align-items: center;
  gap: var(--aven-tag-gap, 0.35rem);
  max-inline-size: 100%;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--aven-tag-border, var(--tag-default-border));
  border-radius: var(--aven-tag-radius, 999px);
  font-size: var(--aven-font-size-sm);
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.tone-neutral {
  --text: var(--aven-color-neutral-text);
  --bg: var(--aven-color-neutral-subtle);
  --border: var(--aven-color-neutral-border);
  --solid: var(--aven-color-neutral-solid);
  --on: var(--aven-color-neutral-on-solid);
}
.tone-accent {
  --text: var(--aven-color-accent-text);
  --bg: var(--aven-color-accent-subtle);
  --border: var(--aven-color-accent-border);
  --solid: var(--aven-color-accent-solid);
  --on: var(--aven-color-accent-on-solid);
}
.tone-success {
  --text: var(--aven-color-success-text);
  --bg: var(--aven-color-success-subtle);
  --border: var(--aven-color-success-border);
  --solid: var(--aven-color-success-solid);
  --on: var(--aven-color-success-on-solid);
}
.tone-warning {
  --text: var(--aven-color-warning-text);
  --bg: var(--aven-color-warning-subtle);
  --border: var(--aven-color-warning-border);
  --solid: var(--aven-color-warning-solid);
  --on: var(--aven-color-warning-on-solid);
}
.tone-danger {
  --text: var(--aven-color-danger-text);
  --bg: var(--aven-color-danger-subtle);
  --border: var(--aven-color-danger-border);
  --solid: var(--aven-color-danger-solid);
  --on: var(--aven-color-danger-on-solid);
}
.tone-critical {
  --text: var(--aven-color-critical-text);
  --bg: var(--aven-color-critical-subtle);
  --border: var(--aven-color-critical-border);
  --solid: var(--aven-color-critical-solid);
  --on: var(--aven-color-critical-on-solid);
}
.tone-info {
  --text: var(--aven-color-info-text);
  --bg: var(--aven-color-info-subtle);
  --border: var(--aven-color-info-border);
  --solid: var(--aven-color-info-solid);
  --on: var(--aven-color-info-on-solid);
}
.tone-secondary {
  --text: var(--aven-color-secondary-text);
  --bg: var(--aven-color-secondary-subtle);
  --border: var(--aven-color-secondary-border);
  --solid: var(--aven-color-secondary-solid);
  --on: var(--aven-color-secondary-on-solid);
}
.aven-tag {
  color: var(--aven-tag-fg, var(--tag-default-fg));
  background: var(--aven-tag-bg, var(--tag-default-bg));
}
.is-outline {
  --tag-default-bg: transparent;
  --tag-default-border: var(--border);
}
.is-solid {
  --tag-default-bg: var(--solid);
  --tag-default-fg: var(--on);
}
.size-xs {
  font-size: var(--aven-font-size-xs);
}
.size-lg {
  font-size: var(--aven-font-size-md);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}
</style>

<script setup lang="ts">
import type { AvenSize, AvenTone, AvenUi } from './types.js'
withDefaults(
  defineProps<{
    tone?: AvenTone
    variant?: 'soft' | 'outline' | 'solid'
    size?: AvenSize
    unstyled?: boolean
    ui?: AvenUi<'root' | 'leading' | 'trailing'>
  }>(),
  { tone: 'neutral', variant: 'soft', size: 'sm', unstyled: false },
)
</script>
<template>
  <span
    :class="[
      'aven-tag',
      `tone-${tone}`,
      `size-${size}`,
      `is-${variant}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
    ><span v-if="$slots.leading" :class="ui?.leading?.class"><slot name="leading" /></span
    ><slot /><span v-if="$slots.trailing" :class="ui?.trailing?.class"
      ><slot name="trailing" /></span
  ></span>
</template>
<style scoped>
.aven-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-inline-size: 100%;
  padding: 0.2rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 999px;
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
.tone-danger,
.tone-critical {
  --text: var(--aven-color-danger-text);
  --bg: var(--aven-color-danger-subtle);
  --border: var(--aven-color-danger-border);
  --solid: var(--aven-color-danger-solid);
  --on: var(--aven-color-danger-on-solid);
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
  color: var(--text);
  background: var(--bg);
}
.is-outline {
  background: transparent;
  border-color: var(--border);
}
.is-solid {
  background: var(--solid);
  color: var(--on);
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

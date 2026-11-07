<script setup lang="ts">
import type { AvenTone, AvenUi } from './types.js'
withDefaults(
  defineProps<{
    tone?: Extract<AvenTone, 'info' | 'success' | 'warning' | 'danger' | 'critical'>
    variant?: 'soft' | 'outline' | 'solid'
    title?: string
    description?: string
    dismissible?: boolean
    dismissLabel?: string
    live?: 'off' | 'polite' | 'assertive'
    unstyled?: boolean
    ui?: AvenUi<'root' | 'icon' | 'title' | 'content' | 'actions' | 'close'>
  }>(),
  {
    tone: 'info',
    variant: 'soft',
    dismissible: false,
    dismissLabel: 'Dismiss',
    live: 'off',
    unstyled: false,
  },
)
const emit = defineEmits<{ dismiss: [payload: { originalEvent: MouseEvent }] }>()
</script>
<template>
  <section
    :class="[
      'aven-alert',
      `tone-${tone}`,
      `is-${variant}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
    :role="tone === 'danger' || tone === 'critical' ? 'alert' : 'status'"
    :aria-live="live === 'off' ? undefined : live"
  >
    <span v-if="$slots.icon" :class="ui?.icon?.class"><slot name="icon" /></span>
    <div class="alert-body">
      <strong v-if="title || $slots.title" :class="ui?.title?.class"
        ><slot name="title">{{ title }}</slot></strong
      >
      <div v-if="description || $slots.default" :class="['alert-content', ui?.content?.class]">
        <slot>{{ description }}</slot>
      </div>
      <div v-if="$slots.actions" :class="['alert-actions', ui?.actions?.class]">
        <slot name="actions" />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      :aria-label="dismissLabel"
      :class="['alert-close', ui?.close?.class]"
      @click="emit('dismiss', { originalEvent: $event })"
    >
      <slot name="close-icon">×</slot>
    </button>
  </section>
</template>
<style scoped>
.aven-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--aven-space-3);
  padding: var(--aven-space-4);
  border: 1px solid;
  border-radius: var(--aven-radius-md);
  min-inline-size: 0;
}
.alert-body {
  min-inline-size: 0;
  flex: 1;
}
.alert-content {
  margin-block-start: 0.25rem;
}
.tone-info {
  --fg: var(--aven-color-info-text);
  --bg: var(--aven-color-info-subtle);
  --border: var(--aven-color-info-border);
  --solid: var(--aven-color-info-solid);
  --on: var(--aven-color-info-on-solid);
}
.tone-success {
  --fg: var(--aven-color-success-text);
  --bg: var(--aven-color-success-subtle);
  --border: var(--aven-color-success-border);
  --solid: var(--aven-color-success-solid);
  --on: var(--aven-color-success-on-solid);
}
.tone-warning {
  --fg: var(--aven-color-warning-text);
  --bg: var(--aven-color-warning-subtle);
  --border: var(--aven-color-warning-border);
  --solid: var(--aven-color-warning-solid);
  --on: var(--aven-color-warning-on-solid);
}
.tone-danger {
  --fg: var(--aven-color-danger-text);
  --bg: var(--aven-color-danger-subtle);
  --border: var(--aven-color-danger-border);
  --solid: var(--aven-color-danger-solid);
  --on: var(--aven-color-danger-on-solid);
}
.tone-critical {
  --fg: var(--aven-color-critical-text);
  --bg: var(--aven-color-critical-subtle);
  --border: var(--aven-color-critical-border);
  --solid: var(--aven-color-critical-solid);
  --on: var(--aven-color-critical-on-solid);
}
.aven-alert {
  color: var(--fg);
  border-color: var(--border);
}
.is-soft {
  background: var(--bg);
}
.is-outline {
  background: transparent;
}
.is-solid {
  background: var(--solid);
  border-color: var(--solid);
  color: var(--on);
}
.alert-close {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 1.25em;
  cursor: pointer;
}
.alert-close:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  color: inherit;
}
</style>

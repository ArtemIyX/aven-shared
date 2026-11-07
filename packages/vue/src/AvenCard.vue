<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    as?: 'article' | 'section' | 'div'
    variant?: 'elevated' | 'outlined' | 'flat'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    unstyled?: boolean
    ui?: AvenUi<'root' | 'header' | 'body' | 'footer' | 'title' | 'description' | 'actions'>
  }>(),
  { as: 'article', variant: 'elevated', padding: 'md', unstyled: false },
)
</script>
<template>
  <component
    :is="as"
    :class="[
      'aven-card',
      `is-${variant}`,
      `padding-${padding}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
    ><header
      v-if="$slots.header || $slots.title || $slots.description || $slots.actions"
      class="card-header"
      :class="ui?.header?.class"
    >
      <slot name="header"
        ><div class="card-heading"><slot name="title" /><slot name="description" /></div>
        <slot name="actions"
      /></slot>
    </header>
    <div :class="['card-body', ui?.body?.class]" :style="ui?.body?.style"><slot /></div>
    <footer
      v-if="$slots.footer"
      :class="['card-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
    >
      <slot name="footer" /></footer
  ></component>
</template>
<style scoped>
.aven-card {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
}
.is-elevated {
  box-shadow: 0 1px 3px var(--aven-color-shadow-ambient);
}
.is-outlined {
  border: 1px solid var(--aven-color-border-subtle);
}
.is-flat {
  background: transparent;
}
.padding-sm .card-body {
  padding: var(--aven-space-3);
}
.padding-md .card-body {
  padding: var(--aven-space-4);
}
.padding-lg .card-body {
  padding: var(--aven-space-6);
}
.padding-none .card-body {
  padding: 0;
}
.card-header,
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--aven-space-4);
  padding: var(--aven-space-4);
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.card-footer {
  border-block-end: 0;
  border-block-start: 1px solid var(--aven-color-border-subtle);
}
.card-heading {
  min-inline-size: 0;
  display: grid;
  gap: var(--aven-space-1);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}
</style>

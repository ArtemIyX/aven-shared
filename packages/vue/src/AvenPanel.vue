<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    as?: 'article' | 'section' | 'div' | 'aside'
    title?: string
    description?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    variant?: 'flat' | 'outline' | 'raised'
    headerDivider?: boolean
    unstyled?: boolean
    ui?: AvenUi<
      | 'root'
      | 'header'
      | 'title'
      | 'description'
      | 'body'
      | 'footer'
      | 'actions'
      | 'leading'
      | 'trailing'
    >
  }>(),
  { as: 'section', padding: 'md', variant: 'outline', headerDivider: true, unstyled: false },
)
</script>
<template>
  <component
    :is="as"
    :class="[
      'aven-panel',
      `is-${variant}`,
      `padding-${padding}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <header
      v-if="
        $slots.header || title || description || $slots.actions || $slots.leading || $slots.trailing
      "
      :class="['panel-header', { 'has-divider': headerDivider }, ui?.header?.class]"
      :style="ui?.header?.style"
    >
      <slot name="header"
        ><slot name="leading" />
        <div class="panel-heading">
          <slot name="title"
            ><h2
              v-if="title"
              class="panel-title"
              :class="ui?.title?.class"
              :style="ui?.title?.style"
            >
              {{ title }}
            </h2></slot
          ><slot name="description"
            ><p
              v-if="description"
              class="panel-description"
              :class="ui?.description?.class"
              :style="ui?.description?.style"
            >
              {{ description }}
            </p></slot
          >
        </div>
        <slot name="trailing" /><slot name="actions"
      /></slot>
    </header>
    <div :class="['panel-body', ui?.body?.class]" :style="ui?.body?.style"><slot /></div>
    <footer
      v-if="$slots.footer"
      :class="['panel-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>
<style scoped>
.aven-panel {
  min-inline-size: 0;
  overflow-wrap: anywhere;
  border-radius: var(--aven-radius-lg);
  background: var(--aven-color-surface-panel, var(--aven-color-surface-card));
  color: var(--aven-color-text-primary);
}
.is-outline {
  border: 1px solid var(--aven-color-border-subtle);
}
.is-raised {
  box-shadow: 0 2px 8px var(--aven-color-shadow-ambient);
}
.panel-header,
.panel-footer {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  padding: var(--aven-space-4);
}
.panel-header.has-divider {
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.panel-footer {
  border-block-start: 1px solid var(--aven-color-border-subtle);
}
.panel-heading {
  display: grid;
  flex: 1;
  min-inline-size: 0;
  gap: var(--aven-space-1);
}
.panel-title,
.panel-description {
  margin: 0;
}
.panel-title {
  font-size: 1rem;
  font-weight: 600;
}
.panel-description {
  color: var(--aven-color-text-secondary);
}
.padding-sm .panel-body {
  padding: var(--aven-space-3);
}
.padding-md .panel-body {
  padding: var(--aven-space-4);
}
.padding-lg .panel-body {
  padding: var(--aven-space-6);
}
.padding-none .panel-body {
  padding: 0;
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
</style>

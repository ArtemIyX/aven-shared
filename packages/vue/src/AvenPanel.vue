<script setup lang="ts">
import type { AvenPanelProps, AvenPanelSlots } from './types.js'
withDefaults(defineProps<AvenPanelProps>(), {
  as: 'section',
  padding: 'md',
  variant: 'outline',
  headingLevel: 2,
  headerDivider: true,
  unstyled: false,
})
defineSlots<AvenPanelSlots>()
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
    v-bind="ui?.root?.attrs"
  >
    <header
      v-if="
        title ||
        description ||
        $slots.header ||
        $slots.title ||
        $slots.description ||
        $slots.actions ||
        $slots.leading ||
        $slots.trailing
      "
      :class="['panel-header', { 'has-divider': headerDivider }, ui?.header?.class]"
      :style="ui?.header?.style"
      v-bind="ui?.header?.attrs"
    >
      <slot name="header">
        <span :class="ui?.leading?.class" :style="ui?.leading?.style" v-bind="ui?.leading?.attrs">
          <slot name="leading" />
        </span>
        <div class="panel-heading">
          <slot name="title">
            <component
              :is="`h${headingLevel}`"
              v-if="title"
              class="panel-title"
              :class="ui?.title?.class"
              :style="ui?.title?.style"
              v-bind="ui?.title?.attrs"
              >{{ title }}</component
            >
          </slot>
          <slot name="description">
            <p
              v-if="description"
              class="panel-description"
              :class="ui?.description?.class"
              :style="ui?.description?.style"
              v-bind="ui?.description?.attrs"
            >
              {{ description }}
            </p>
          </slot>
        </div>
        <span
          :class="ui?.trailing?.class"
          :style="ui?.trailing?.style"
          v-bind="ui?.trailing?.attrs"
        >
          <slot name="trailing" />
        </span>
        <div :class="ui?.actions?.class" :style="ui?.actions?.style" v-bind="ui?.actions?.attrs">
          <slot name="actions" />
        </div>
      </slot>
    </header>
    <div :class="['panel-body', ui?.body?.class]" :style="ui?.body?.style" v-bind="ui?.body?.attrs">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      :class="['panel-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
      v-bind="ui?.footer?.attrs"
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
  border: 0.0625rem solid var(--aven-color-border-subtle);
}
.is-raised {
  box-shadow: 0 0.125rem 0.5rem var(--aven-color-shadow-ambient);
}
.panel-header,
.panel-footer {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  padding: var(--aven-space-4);
}
.panel-header.has-divider {
  border-block-end: 0.0625rem solid var(--aven-color-border-subtle);
}
.panel-footer {
  border-block-start: 0.0625rem solid var(--aven-color-border-subtle);
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
@media (forced-colors: active) {
  .is-outline {
    border-color: CanvasText;
  }
}
@media print {
  .aven-panel {
    box-shadow: none;
  }
}
</style>

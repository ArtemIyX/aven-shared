<script setup lang="ts">
import type { AvenCardProps, AvenCardSlots } from './types.js'
withDefaults(defineProps<AvenCardProps>(), {
  as: 'article',
  variant: 'elevated',
  padding: 'md',
  headingLevel: 2,
  unstyled: false,
})
defineSlots<AvenCardSlots>()
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
    v-bind="ui?.root?.attrs"
    ><header
      v-if="
        title ||
        description ||
        $slots.header ||
        $slots.title ||
        $slots.description ||
        $slots.actions
      "
      class="card-header"
      :class="ui?.header?.class"
      :style="ui?.header?.style"
      v-bind="ui?.header?.attrs"
    >
      <slot name="header"
        ><div class="card-heading">
          <component
            :is="`h${headingLevel}`"
            v-if="title || $slots.title"
            class="card-title"
            :class="ui?.title?.class"
            :style="ui?.title?.style"
            v-bind="ui?.title?.attrs"
            ><slot name="title">{{ title }}</slot></component
          >
          <p
            v-if="description || $slots.description"
            class="card-description"
            :class="ui?.description?.class"
            :style="ui?.description?.style"
            v-bind="ui?.description?.attrs"
          >
            <slot name="description">{{ description }}</slot>
          </p>
        </div>
        <div :class="ui?.actions?.class" :style="ui?.actions?.style" v-bind="ui?.actions?.attrs">
          <slot name="actions" />
        </div>
      </slot>
    </header>
    <div :class="['card-body', ui?.body?.class]" :style="ui?.body?.style" v-bind="ui?.body?.attrs">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      :class="['card-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
      v-bind="ui?.footer?.attrs"
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
.card-title,
.card-description {
  margin: 0;
}
.card-title {
  font-size: 1rem;
  font-weight: 600;
}
.card-description {
  color: var(--aven-color-text-secondary);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}
@media (forced-colors: active) {
  .is-outlined {
    border-color: CanvasText;
  }
}
@media print {
  .aven-card {
    box-shadow: none;
  }
}
</style>

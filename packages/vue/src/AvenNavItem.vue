<script setup lang="ts" generic="Key extends string | number">
import { computed, useAttrs } from 'vue'
import type { AvenNavItemEvents, AvenNavItemProps, AvenNavItemSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenNavItemProps<Key>>(), {
  active: false,
  expanded: false,
  depth: 0,
  density: 'comfortable',
  unstyled: false,
})
const emit = defineEmits<AvenNavItemEvents<Key>>()
defineSlots<AvenNavItemSlots<Key>>()
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function navigate(originalEvent: MouseEvent) {
  if (props.item.href && !props.item.disabled)
    emit('navigate', { key: props.item.key, item: props.item, originalEvent })
}
function toggle(event: MouseEvent) {
  emit('update:expanded', {
    key: props.item.key,
    expanded: !props.expanded,
    originalEvent: event,
  })
}
</script>

<template>
  <li
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    :class="[
      'aven-nav-item',
      `density-${density}`,
      { 'is-active': active, 'is-disabled': item.disabled, 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <div class="nav-row">
      <a
        v-bind="ui?.link?.attrs"
        v-if="item.href && !item.disabled"
        :href="item.href"
        :aria-current="active ? 'page' : undefined"
        :class="['nav-link', ui?.link?.class]"
        :style="ui?.link?.style"
        @click="navigate($event)"
      >
        <slot name="leading" :item="item" />
        <slot :item="item" :key="item.key" :active="active" :expanded="expanded" :depth="depth">{{
          item.label
        }}</slot>
        <span
          v-bind="ui?.badge?.attrs"
          v-if="item.badge !== undefined"
          :class="['nav-badge', ui?.badge?.class]"
        >
          <slot name="badge" :item="item">{{ item.badge }}</slot>
        </span>
        <slot name="trailing" :item="item" />
      </a>
      <span
        v-bind="ui?.link?.attrs"
        v-else
        :class="['nav-link', { 'nav-disabled': item.disabled }, ui?.link?.class]"
        :style="ui?.link?.style"
      >
        <slot name="leading" :item="item" />
        <slot :item="item" :key="item.key" :active="active" :expanded="expanded" :depth="depth">{{
          item.label
        }}</slot>
        <slot name="trailing" :item="item" />
      </span>
      <button
        v-bind="ui?.disclosure?.attrs"
        v-if="item.children?.length"
        type="button"
        :class="['nav-disclosure', ui?.disclosure?.class]"
        :aria-expanded="expanded"
        :aria-label="`${expanded ? 'Collapse' : 'Expand'} ${item.label}`"
        @click="toggle"
      >
        {{ expanded ? '−' : '+' }}
      </button>
    </div>
    <slot v-if="item.children?.length && expanded" name="group-label" :item="item" />
    <slot
      v-if="item.children?.length && expanded"
      name="children"
      :item="item"
      :depth="depth + 1"
    />
  </li>
</template>

<style scoped>
.aven-nav-item {
  min-inline-size: 0;
  list-style: none;
  color: var(--aven-color-text-primary);
}
.nav-row {
  display: flex;
  align-items: center;
  min-inline-size: 0;
  gap: var(--aven-space-1);
}
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--aven-space-2);
  flex: 1;
  min-inline-size: 0;
  min-block-size: 2.5rem;
  padding-inline: var(--aven-space-3);
  border-radius: var(--aven-radius-md);
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
}
.density-compact .nav-link {
  min-block-size: 2rem;
  padding-inline: var(--aven-space-2);
}
.density-spacious .nav-link {
  min-block-size: 3rem;
}
.is-active > .nav-row > .nav-link {
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-primary);
  font-weight: 600;
}
.nav-link:hover {
  background: var(--aven-color-surface-hover);
}
.nav-link:focus-visible,
.nav-disclosure:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.nav-disclosure {
  min-inline-size: 2.75rem;
  min-block-size: 2.75rem;
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.nav-disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .nav-link {
  border-radius: 0;
  padding-inline: 0;
}
.is-unstyled.is-active > .nav-row > .nav-link {
  background: transparent;
  text-decoration: underline;
}
@media (forced-colors: active) {
  .is-active > .nav-row > .nav-link {
    outline: 0.0625rem solid Highlight;
  }
}
</style>

<script setup lang="ts" generic="Item">
import { computed } from 'vue'
import type { AvenAvatarGroupEvents, AvenAvatarGroupProps, AvenAvatarGroupSlots } from './types.js'
const props = withDefaults(defineProps<AvenAvatarGroupProps<Item>>(), {
  overlap: 8,
  unstyled: false,
  label: 'People',
})
const emit = defineEmits<AvenAvatarGroupEvents<Item>>()
defineSlots<AvenAvatarGroupSlots<Item>>()
const limit = computed(() =>
  props.max === undefined || !Number.isFinite(props.max)
    ? props.items.length
    : Math.max(0, Math.floor(props.max)),
)
const visible = () => props.items.slice(0, limit.value)
const hidden = () => props.items.slice(limit.value)
const itemKey = (item: Item, index: number) => {
  if (props.getKey) return props.getKey(item, index)
  if (item && typeof item === 'object') {
    const record = item as Record<string, unknown>
    const key = record.key ?? record.id ?? record.value
    if (typeof key === 'string' || typeof key === 'number') return key
  }
  return index
}
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    role="group"
    :aria-label="label"
    :class="['aven-avatar-group', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[{ '--aven-avatar-overlap': `${overlap}px` }, ui?.root?.style]"
  >
    <span
      v-for="(item, index) in visible()"
      :key="itemKey(item, index)"
      v-bind="ui?.avatar?.attrs"
      :class="['avatar-item', ui?.avatar?.class]"
      :style="[
        {
          zIndex: visible().length - index,
          marginInlineStart: index ? `-${overlap}px` : undefined,
        },
        ui?.avatar?.style,
      ]"
      ><slot name="avatar" :item="item" :index="index">{{ String(item) }}</slot></span
    ><button
      v-if="hidden().length && $slots.overflow"
      v-bind="ui?.overflow?.attrs"
      type="button"
      :class="['avatar-overflow', ui?.overflow?.class]"
      :style="ui?.overflow?.style"
      :aria-label="`${hidden().length} more ${label.toLocaleLowerCase()}`"
      @click="emit('overflowClick', { hiddenItems: hidden(), originalEvent: $event })"
    >
      <slot name="overflow" :hidden-items="hidden()" :count="hidden().length"
        >+{{ hidden().length }}</slot
      ></button
    ><span
      v-else-if="hidden().length"
      v-bind="ui?.overflow?.attrs"
      :class="['avatar-overflow', ui?.overflow?.class]"
      :style="ui?.overflow?.style"
      :aria-label="`${hidden().length} more ${label.toLocaleLowerCase()}`"
      >+{{ hidden().length }}</span
    >
  </div>
</template>
<style scoped>
.aven-avatar-group {
  display: inline-flex;
  align-items: center;
  isolation: isolate;
  min-inline-size: 0;
}
.avatar-item {
  display: inline-flex;
  flex: none;
  border: 2px solid var(--aven-color-surface-base);
  border-radius: 50%;
}
.avatar-overflow {
  display: grid;
  place-items: center;
  flex: none;
  min-inline-size: 2.5rem;
  block-size: 2.5rem;
  margin-inline-start: calc(var(--aven-avatar-overlap) * -1);
  border: 2px solid var(--aven-color-surface-base);
  border-radius: 50%;
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-primary);
  font-size: var(--aven-font-size-xs);
  font-weight: 600;
}
.avatar-overflow:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 1px;
}
.is-unstyled .avatar-item,
.is-unstyled .avatar-overflow {
  border: 0;
}
</style>

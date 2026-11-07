<script setup lang="ts">
import { useAttrs } from 'vue'
import type { AvenListItemProps, AvenListItemSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenListItemProps>(), {
  selected: false,
  disabled: false,
  dense: false,
  divided: false,
  unstyled: false,
})
defineSlots<AvenListItemSlots>()
const attrs = useAttrs()
</script>

<template>
  <li
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-list-item',
      {
        'is-selected': props.selected,
        'is-disabled': props.disabled,
        'is-dense': props.dense,
        'has-divider': props.divided,
        'is-unstyled': props.unstyled,
      },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <span
      v-if="$slots.leading"
      :class="['list-item-leading', props.ui?.leading?.class]"
      :style="props.ui?.leading?.style"
    >
      <slot name="leading" />
    </span>
    <span
      :class="['list-item-content', props.ui?.content?.class]"
      :style="props.ui?.content?.style"
    >
      <slot />
    </span>
    <span
      v-if="$slots.trailing"
      :class="['list-item-trailing', props.ui?.trailing?.class]"
      :style="props.ui?.trailing?.style"
    >
      <slot name="trailing" />
    </span>
    <span
      v-if="$slots.separator"
      :class="['list-item-separator', props.ui?.separator?.class]"
      :style="props.ui?.separator?.style"
    >
      <slot name="separator" />
    </span>
  </li>
</template>

<style scoped>
.aven-list-item {
  --aven-list-item-background: transparent;
  --aven-list-item-padding: var(--aven-space-3) var(--aven-space-4);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  min-block-size: 2.75rem;
  min-inline-size: 0;
  padding: var(--aven-list-item-padding);
  background: var(--aven-list-item-background);
  color: var(--aven-color-text-primary);
}
.is-dense {
  --aven-list-item-padding: var(--aven-space-2) var(--aven-space-3);
  min-block-size: 2.25rem;
}
.is-selected {
  --aven-list-item-background: var(--aven-color-surface-selected);
}
.is-disabled {
  color: var(--aven-color-text-disabled);
}
.has-divider {
  border-block-end: 1px solid var(--aven-color-separator-row);
}
.list-item-leading,
.list-item-trailing {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--aven-space-2);
}
.list-item-content {
  flex: 1 1 auto;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.list-item-separator {
  color: var(--aven-color-text-tertiary);
}
.is-unstyled {
  --aven-list-item-background: transparent;
  border-color: transparent;
}
@media (forced-colors: active) {
  .is-selected {
    outline: 1px solid Highlight;
  }
  .has-divider {
    border-color: CanvasText;
  }
}
@media print {
  .aven-list-item {
    break-inside: avoid;
    color: #000;
    background: transparent;
  }
}
</style>

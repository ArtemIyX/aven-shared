<script setup lang="ts" generic="Key extends string | number = string">
import { computed, useAttrs } from 'vue'
import type { AvenTabPanelProps, AvenTabPanelSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTabPanelProps<Key>>(), { unstyled: false })
defineSlots<AvenTabPanelSlots<Key>>()
const attrs = useAttrs()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
</script>
<template>
  <section
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    :id="id"
    role="tabpanel"
    :aria-labelledby="labelledBy"
    :hidden="!active"
    tabindex="0"
    :class="['aven-tab-panel', { 'is-unstyled': unstyled }, attrs.class, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <slot :item="item" :key="item.key" :active="active" />
  </section>
</template>
<style scoped>
.aven-tab-panel {
  min-inline-size: 0;
  padding-block: var(--aven-tabs-panel-padding, var(--aven-space-3));
  overflow-wrap: anywhere;
}
.aven-tab-panel:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.is-unstyled {
  padding: 0;
}
@media print {
  .aven-tab-panel[hidden] {
    display: none;
  }
}
</style>

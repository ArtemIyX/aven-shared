<script setup lang="ts">
import { useAttrs } from 'vue'
import AvenAlert from './AvenAlert.vue'
import type { AvenBannerEvents, AvenBannerProps, AvenBannerSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenBannerProps>(), {
  tone: 'info',
  variant: 'soft',
  dismissible: false,
  dismissLabel: 'Dismiss',
  live: 'off',
  unstyled: false,
})
const emit = defineEmits<AvenBannerEvents>()
defineSlots<AvenBannerSlots>()
const attrs = useAttrs()
</script>

<template>
  <AvenAlert
    v-bind="{ ...props, ...attrs }"
    :class="['aven-banner', attrs.class]"
    @dismiss="emit('dismiss', $event)"
  >
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.default" #default
      ><slot>{{ props.description }}</slot></template
    >
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <template v-if="$slots['close-icon']" #close-icon><slot name="close-icon" /></template>
  </AvenAlert>
</template>

<style scoped>
:deep(.aven-alert.aven-banner) {
  inline-size: 100%;
  max-inline-size: 100%;
  border-radius: 0;
  padding-inline: clamp(var(--aven-space-3), 3vw, var(--aven-space-6));
}
@media (max-width: 36rem) {
  :deep(.aven-alert.aven-banner) {
    gap: var(--aven-space-2);
    padding-block: var(--aven-space-3);
  }
}
</style>

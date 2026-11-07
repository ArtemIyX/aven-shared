<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import AvenDrawer from './AvenDrawer.vue'
import type { AvenSheetEvents, AvenSheetProps, AvenSheetSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSheetProps>(), {
  side: 'bottom',
  defaultSize: '24rem',
  modal: true,
})
const emit = defineEmits<AvenSheetEvents>()
defineSlots<AvenSheetSlots>()
const attrs = useAttrs()
const drawer = ref<{ close: () => void; focus: () => void; resize: (size: number) => void } | null>(
  null,
)
defineExpose({
  close: () => drawer.value?.close(),
  focus: () => drawer.value?.focus(),
  resize: (size: number) => drawer.value?.resize(size),
})
</script>

<template>
  <AvenDrawer
    ref="drawer"
    v-bind="{ ...props, ...attrs }"
    class="aven-sheet"
    @update:open="emit('update:open', $event)"
    @open-change="emit('openChange', $event)"
    @before-close="emit('beforeClose', $event)"
    @after-open="emit('afterOpen')"
    @after-close="emit('afterClose')"
    @update:size="emit('update:size', $event)"
    @resize-start="emit('resizeStart', $event)"
    @resize-end="emit('resizeEnd', $event)"
  >
    <template v-if="$slots.header" #header="scope"><slot name="header" v-bind="scope" /></template>
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.description" #description><slot name="description" /></template>
    <template #default="scope"><slot v-bind="scope" /></template>
    <template v-if="$slots.footer" #footer="scope"><slot name="footer" v-bind="scope" /></template>
    <template v-if="$slots.actions" #actions="scope"
      ><slot name="actions" v-bind="scope"
    /></template>
    <template v-if="$slots['close-icon']" #close-icon><slot name="close-icon" /></template>
    <template v-if="$slots['resize-handle']" #resize-handle="scope">
      <slot name="resize-handle" v-bind="scope" />
    </template>
  </AvenDrawer>
</template>

<style scoped>
:deep(.aven-dialog.aven-sheet.side-bottom) {
  border-start-start-radius: var(--aven-radius-lg);
  border-start-end-radius: var(--aven-radius-lg);
}
:deep(.aven-dialog.aven-sheet.side-top) {
  border-end-start-radius: var(--aven-radius-lg);
  border-end-end-radius: var(--aven-radius-lg);
}
</style>

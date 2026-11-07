<script setup lang="ts" generic="Key extends string | number">
import { computed, ref, useAttrs, watch } from 'vue'
import type {
  AvenCommand,
  AvenSplitButtonEvents,
  AvenSplitButtonProps,
  AvenSplitButtonSlots,
} from './types.js'
import type { AvenOpenChange } from './composables.js'
import AvenButton from './AvenButton.vue'
import AvenButtonGroup from './AvenButtonGroup.vue'
import AvenDropdownMenu from './AvenDropdownMenu.vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenSplitButtonProps<Key>>(), {
  open: undefined as boolean | undefined,
  defaultOpen: false,
  placement: 'bottom-start',
  offset: 4,
  closeOnSelect: true,
  primaryDisabled: false,
  menuDisabled: false,
  label: 'Actions',
  menuLabel: 'More actions',
  variant: 'solid',
  tone: 'accent',
  size: 'md',
  type: 'button',
  loading: false,
  attached: true,
  unstyled: false,
})
const emit = defineEmits<AvenSplitButtonEvents<Key>>()
defineSlots<AvenSplitButtonSlots<Key>>()
const attrs = useAttrs()
const localOpen = ref(props.defaultOpen)
const openState = computed(() => (props.open === undefined ? localOpen.value : props.open))
const groupClass = computed(() => [attrs.class, props.ui?.root?.class])
const groupStyle = computed(() => [attrs.style, props.ui?.root?.style])
watch(
  () => props.open,
  (next) => {
    if (next !== undefined) localOpen.value = next
  },
)

function updateOpen(next: boolean) {
  if (props.open === undefined) localOpen.value = next
  emit('update:open', next)
}

function onOpenChange(change: AvenOpenChange) {
  emit('openChange', change)
}

function onSelect(payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }) {
  emit('select', payload)
}
</script>

<template>
  <AvenButtonGroup
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :label="label"
    :attached="attached"
    orientation="horizontal"
    :unstyled="unstyled"
    :class="groupClass"
    :style="groupStyle"
  >
    <AvenButton
      v-bind="props.ui?.primary?.attrs"
      :type="type"
      :variant="variant"
      :tone="tone"
      :size="size"
      :disabled="primaryDisabled"
      :loading="loading"
      :unstyled="unstyled"
      :ui="{ root: props.ui?.primary }"
      :class="['split-primary', props.ui?.primary?.class]"
      :style="props.ui?.primary?.style"
      @click="emit('click', $event)"
    >
      <template #leading="scope" v-if="$slots.leading">
        <slot name="leading" v-bind="scope" />
      </template>
      <slot />
    </AvenButton>
    <AvenDropdownMenu
      :items="items"
      :open="openState"
      :placement="placement"
      :offset="offset"
      :close-on-select="closeOnSelect"
      :disabled="menuDisabled"
      :label="menuLabel"
      :unstyled="unstyled"
      :ui="{ content: props.ui?.content }"
      class="split-menu-container"
      @update:open="updateOpen"
      @open-change="onOpenChange"
      @select="onSelect"
    >
      <template #trigger="{ triggerAttrs, triggerRef, open }">
        <slot
          name="trigger"
          :trigger-attrs="{ ...triggerAttrs, ...props.ui?.trigger?.attrs }"
          :trigger-ref="triggerRef"
          :open="open"
        >
          <AvenButton
            v-bind="{ ...triggerAttrs, ...props.ui?.trigger?.attrs }"
            :ref="triggerRef"
            type="button"
            :variant="variant"
            :tone="tone"
            :size="size"
            :disabled="menuDisabled"
            :unstyled="unstyled"
            :aria-label="menuLabel"
            :class="['split-menu-trigger', props.ui?.trigger?.class]"
            :style="props.ui?.trigger?.style"
          >
            <slot name="trigger-icon" :open="open">⌄</slot>
          </AvenButton>
        </slot>
      </template>
      <template #item="scope">
        <slot name="item" v-bind="scope">{{ scope.item.label }}</slot>
      </template>
      <template #header><slot name="menu-header" /></template>
      <template #footer><slot name="menu-footer" /></template>
    </AvenDropdownMenu>
  </AvenButtonGroup>
</template>

<style scoped>
.split-primary {
  min-inline-size: 2.75rem;
}
.split-menu-container {
  display: inline-flex;
  vertical-align: middle;
}
.split-menu-trigger {
  min-inline-size: 2.75rem;
  padding-inline: var(--aven-space-3);
}
.is-attached :deep(.split-menu-trigger) {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}
.is-attached :deep(.dropdown-content) {
  z-index: 950;
}
@media (max-width: 28rem) {
  .split-primary {
    min-inline-size: 0;
  }
  .split-menu-trigger {
    min-inline-size: 2.75rem;
  }
}
</style>

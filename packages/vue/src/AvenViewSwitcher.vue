<script setup lang="ts" generic="T extends string | number">
import { computed, shallowRef, watch, useAttrs } from 'vue'
import AvenSegmentedControl from './AvenSegmentedControl.vue'
import AvenSwitcher from './AvenSwitcher.vue'
import type {
  AvenOption,
  AvenViewSwitcherProps,
  AvenViewSwitcherEvents,
  AvenViewSwitcherSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenViewSwitcherProps<T>>(), {
  defaultValue: null,
  mode: 'auto',
  loading: false,
  disabled: false,
  unstyled: false,
})
const emit = defineEmits<AvenViewSwitcherEvents<T>>()
defineSlots<AvenViewSwitcherSlots<T>>()
const attrs = useAttrs()
const local = shallowRef<T | null>(props.defaultValue)
const value = computed(() => (props.modelValue === undefined ? local.value : props.modelValue))
const displayMode = computed(() =>
  props.mode === 'auto' ? (props.items.length <= 4 ? 'segments' : 'menu') : props.mode,
)
const selected = computed(() => props.items.find((item) => Object.is(item.value, value.value)))
const segments = computed(() =>
  props.items.map((item) => ({
    ...item,
    disabled: item.disabled || props.disabled || props.loading,
  })),
)
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) local.value = next
  },
)
function choose(next: T) {
  if (Object.is(next, value.value) || props.disabled || props.loading) return
  if (props.modelValue === undefined) local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function switcherValue(next: T | null) {
  if (next !== null) choose(next)
}
function segmentValue(next: T) {
  choose(next)
}
</script>

<template>
  <div
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    role="group"
    :aria-label="props.label"
    :class="[
      'aven-view-switcher',
      `is-${displayMode}`,
      { 'is-disabled': props.disabled || props.loading, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
  >
    <AvenSegmentedControl
      v-bind="props.ui?.view?.attrs"
      v-if="displayMode === 'segments'"
      :model-value="value"
      :items="segments"
      :name="props.name"
      :unstyled="props.unstyled"
      :class="props.ui?.view?.class"
      :style="props.ui?.view?.style"
      @update:model-value="segmentValue"
    >
      <template #item="{ item, selected: isSelected, disabled }"
        ><slot name="view" :item="item" :selected="isSelected">{{ item.label }}</slot
        ><span v-if="disabled" class="sr-only">unavailable</span></template
      >
      <template #leading="{ item }"><slot name="leading" :item="item" /></template>
      <template #trailing="{ item }"><slot name="trailing" :item="item" /></template>
    </AvenSegmentedControl>
    <AvenSwitcher
      v-else
      :model-value="value"
      :options="props.items"
      :label="props.label"
      :name="props.name"
      :loading="props.loading"
      :disabled="props.disabled"
      :unstyled="props.unstyled"
      :ui="{ root: props.ui?.view }"
      @update:model-value="switcherValue"
    >
      <template v-if="$slots.trigger" #trigger="scope">
        <slot name="trigger" v-bind="scope" />
      </template>
      <template #option="scope"
        ><slot name="option" v-bind="scope">
          <slot name="view" :item="scope.item" :selected="scope.selected">{{
            scope.item.label
          }}</slot></slot
        ></template
      >
      <template #leading="{ item }"><slot name="leading" :item="item" /></template>
      <template #trailing="{ item }"><slot name="trailing" :item="item" /></template>
      <template #header><slot name="header" /></template>
      <template #footer><slot name="footer" /></template>
    </AvenSwitcher>
    <span v-if="props.loading && displayMode === 'segments'" class="view-status" role="status"
      >Loading views…</span
    >
    <slot name="footer" v-if="displayMode === 'segments'" />
  </div>
</template>

<style scoped>
.aven-view-switcher {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.view-status {
  color: var(--aven-color-text-secondary);
}
.is-unstyled {
  border: 0;
  background: transparent;
}
.sr-only {
  position: absolute;
  inline-size: 0.0625rem;
  block-size: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 30rem) {
  .aven-view-switcher {
    max-inline-size: 100%;
  }
}
@media (forced-colors: active) {
  .aven-view-switcher :deep(button:focus-visible) {
    outline: 0.125rem solid Highlight;
  }
}
</style>

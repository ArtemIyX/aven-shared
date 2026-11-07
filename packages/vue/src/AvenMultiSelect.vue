<script setup lang="ts" generic="T extends string | number">
import AvenCombobox from './AvenCombobox.vue'
import type { AvenComboboxSlots, AvenMultiSelectEvents, AvenMultiSelectProps } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenMultiSelectProps<T>>(), {
  defaultValue: () => [],
  defaultQuery: '',
  remote: false,
  loading: false,
  clearable: false,
  clearLabel: 'Clear selection',
  creatable: false,
  defaultOpen: false,
  open: undefined,
  placement: 'bottom',
  required: false,
  disabled: false,
  readonly: false,
  invalid: false,
  unstyled: false,
})
const emit = defineEmits<AvenMultiSelectEvents<T>>()
defineSlots<AvenComboboxSlots<T>>()
</script>

<template>
  <AvenCombobox
    v-bind="{ ...props, ...$attrs }"
    multiple
    @update:model-value="emit('update:modelValue', $event as T[])"
    @change="emit('change', $event as T[])"
    @update:query="emit('update:query', $event)"
    @create="emit('create', $event)"
    @clear="emit('clear', $event)"
    @remove="emit('remove', $event)"
    @update:open="emit('update:open', $event)"
    @open-change="emit('openChange', $event)"
    @load-more="emit('loadMore', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template #selected="scope"><slot name="selected" v-bind="scope" /></template>
    <template #chip="scope"><slot name="chip" v-bind="scope" /></template>
    <template #option="scope"><slot name="option" v-bind="scope" /></template>
    <template #group="scope"><slot name="group" v-bind="scope" /></template>
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
    <template #empty="scope"><slot name="empty" v-bind="scope" /></template>
    <template #loading><slot name="loading" /></template>
    <template #error="scope"><slot name="error" v-bind="scope" /></template>
    <template #create="scope"><slot name="create" v-bind="scope" /></template>
    <template #popup-header><slot name="popup-header" /></template>
    <template #popup-footer><slot name="popup-footer" /></template>
    <template #label><slot name="label" /></template>
    <template #description><slot name="description" /></template>
  </AvenCombobox>
</template>

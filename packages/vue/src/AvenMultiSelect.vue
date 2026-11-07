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
    v-slots="$slots"
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
  />
</template>

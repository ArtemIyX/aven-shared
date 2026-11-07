<script setup lang="ts">
import { useAttrs } from 'vue'
import AvenFileInput from './AvenFileInput.vue'
import type { AvenFileInputEvents, AvenFileInputProps, AvenFileInputSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFileInputProps>(), { dropzone: true })
const emit = defineEmits<AvenFileInputEvents>()
defineSlots<AvenFileInputSlots>()
const attrs = useAttrs()
</script>

<template>
  <AvenFileInput
    v-bind="{ ...attrs, ...props }"
    dropzone
    @update:model-value="emit('update:modelValue', $event)"
    @select="emit('select', $event)"
    @reject="emit('reject', $event)"
    @remove="emit('remove', $event)"
    @retry="emit('retry', $event)"
    @cancel="emit('cancel', $event)"
  >
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope" /></template>
    <template v-if="$slots.file" #file="scope"><slot name="file" v-bind="scope" /></template>
    <template v-if="$slots.progress" #progress="scope"
      ><slot name="progress" v-bind="scope"
    /></template>
    <template v-if="$slots.empty" #empty><slot name="empty" /></template>
    <template v-if="$slots.error" #error="scope"><slot name="error" v-bind="scope" /></template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </AvenFileInput>
</template>

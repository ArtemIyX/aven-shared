<script setup lang="ts">
import { ref } from 'vue'
import type { AvenPropertyRowEvents, AvenPropertyRowProps, AvenPropertyRowSlots } from './types.js'
const props = withDefaults(defineProps<AvenPropertyRowProps>(), {
  orientation: 'horizontal',
  labelWidth: '8rem',
  truncate: false,
  editable: false,
  unstyled: false,
})
const emit = defineEmits<AvenPropertyRowEvents>()
const slots = defineSlots<AvenPropertyRowSlots>()
const editing = ref(false)
function startEdit(originalEvent: MouseEvent) {
  if (!props.editable) return
  editing.value = !!slots.editor
  emit('edit', { originalEvent })
}
function finish() {
  editing.value = false
  emit('finish')
}
function cancel() {
  editing.value = false
  emit('cancel')
}
</script>
<template>
  <div
    :class="[
      'aven-property-row',
      `is-${orientation}`,
      { 'is-unstyled': unstyled, 'is-truncated': truncate, 'is-editing': editing },
      ui?.root?.class,
    ]"
    :style="[{ '--aven-property-label-width': labelWidth }, ui?.root?.style]"
    v-bind="ui?.root?.attrs"
  >
    <dt
      :class="['property-label', ui?.label?.class]"
      :style="ui?.label?.style"
      v-bind="ui?.label?.attrs"
    >
      <slot name="label">{{ label }}</slot>
    </dt>
    <dd
      :class="['property-value', ui?.value?.class]"
      :style="ui?.value?.style"
      v-bind="ui?.value?.attrs"
    >
      <div
        v-if="editing && $slots.editor"
        :class="['property-editor', ui?.editor?.class]"
        :style="ui?.editor?.style"
        v-bind="ui?.editor?.attrs"
      >
        <slot name="editor" :finish="finish" :cancel="cancel" />
      </div>
      <template v-else>
        <span class="property-content"
          ><slot>{{ value }}</slot></span
        >
        <small
          v-if="description || $slots.description"
          :class="['property-description', ui?.description?.class]"
          :style="ui?.description?.style"
          v-bind="ui?.description?.attrs"
          ><slot name="description">{{ description }}</slot></small
        >
        <small
          v-if="$slots.help"
          :class="['property-help', ui?.help?.class]"
          :style="ui?.help?.style"
          v-bind="ui?.help?.attrs"
          ><slot name="help"
        /></small>
        <button
          v-if="editable && (!editing || !$slots.editor)"
          type="button"
          :class="['property-edit', ui?.edit?.class]"
          :style="ui?.edit?.style"
          v-bind="ui?.edit?.attrs"
          :aria-label="`Edit ${label}`"
          @click="startEdit($event)"
        >
          <slot name="edit-icon">Edit</slot>
        </button>
      </template>
    </dd>
  </div>
</template>
<style scoped>
.aven-property-row {
  display: grid;
  grid-template-columns: minmax(0, var(--aven-property-label-width, 8rem)) minmax(0, 2fr);
  gap: var(--aven-space-4);
  padding-block: var(--aven-space-3);
  border-block-end: 0.0625rem solid var(--aven-color-border-subtle);
  color: var(--aven-color-text-primary);
}
.is-vertical {
  grid-template-columns: 1fr;
  gap: var(--aven-space-1);
}
.property-label {
  color: var(--aven-color-text-secondary);
}
.property-value {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--aven-space-1) var(--aven-space-2);
  margin: 0;
  min-inline-size: 0;
  font-weight: 500;
}
.property-content {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}
.is-truncated .property-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.property-description,
.property-help {
  display: block;
  flex-basis: 100%;
  color: var(--aven-color-text-secondary);
  font-weight: 400;
}
.property-edit {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-2);
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: transparent;
  color: var(--aven-color-action-text);
  font: inherit;
  cursor: pointer;
}
.property-edit:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.is-unstyled {
  border: 0;
  padding: 0;
}
@media (max-width: 32rem) {
  .is-horizontal {
    grid-template-columns: 1fr;
    gap: var(--aven-space-1);
  }
}
@media (forced-colors: active) {
  .property-edit:focus-visible {
    outline-color: Highlight;
  }
}
</style>

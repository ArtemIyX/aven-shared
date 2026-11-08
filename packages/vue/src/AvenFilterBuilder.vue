<script setup lang="ts" generic="Key extends string = string">
import { computed, ref, shallowRef, useAttrs } from 'vue'
import AvenFilterGroupEditor from './AvenFilterGroupEditor.vue'
import { useAvenId } from './composables.js'
import type {
  AvenFilterBuilderEvents,
  AvenFilterBuilderProps,
  AvenFilterBuilderSlots,
  AvenFilterCondition,
  AvenFilterDefinition,
  AvenFilterGroup,
  AvenFilterNode,
} from './types.js'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenFilterBuilderProps<Key> & { id?: string }>(), {
  defaultValue: undefined,
  maxDepth: 3,
  allowGroups: true,
  disabled: false,
  loading: false,
  label: 'Filter builder',
  applyLabel: 'Apply filters',
  resetLabel: 'Reset filters',
  unstyled: false,
})
const emit = defineEmits<AvenFilterBuilderEvents<Key>>()
const slots = defineSlots<AvenFilterBuilderSlots<Key>>()
const attrs = useAttrs()
const root = ref<HTMLElement>()
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
const generatedId = useAvenId(props.id, 'filter-builder')
function cloneGroup(group: AvenFilterGroup<Key>): AvenFilterGroup<Key> {
  return {
    ...group,
    children: group.children.map((node) =>
      isGroup(node)
        ? cloneGroup(node)
        : { ...node, value: Array.isArray(node.value) ? [...node.value] : node.value },
    ),
  }
}
function isGroup(node: AvenFilterNode<Key>): node is AvenFilterGroup<Key> {
  return 'children' in node
}
const initialValue = props.defaultValue
  ? cloneGroup(props.defaultValue)
  : { id: `${generatedId}-root`, operator: 'and' as const, children: [] }
const internalValue = shallowRef(initialValue)
const value = computed(() => props.modelValue ?? internalValue.value)
const activeDisabled = computed(() => props.disabled || props.loading)
function requestValue(next: AvenFilterGroup<Key>) {
  if (props.modelValue === undefined) internalValue.value = next
  emit('update:modelValue', next)
}
function setGroup(next: AvenFilterGroup<Key>) {
  if (Object.is(value.value.id, next.id)) {
    requestValue(next)
    return
  }
  const update = (group: AvenFilterGroup<Key>): AvenFilterGroup<Key> => ({
    ...group,
    children: group.children.map((node) =>
      isGroup(node) ? (Object.is(node.id, next.id) ? next : update(node)) : node,
    ),
  })
  requestValue(update(value.value))
}
function findDefinition(key: string): AvenFilterDefinition | undefined {
  return props.definitions.find((definition) => definition.key === key)
}
function invalidNodeIds(group: AvenFilterGroup<Key>): Array<string | number> {
  const invalid: Array<string | number> = []
  if (!group.children.length) invalid.push(group.id)
  for (const node of group.children) {
    if (isGroup(node)) {
      invalid.push(...invalidNodeIds(node))
      continue
    }
    const definition = findDefinition(node.field)
    const value = node.value
    let validValue = value !== null && value !== ''
    if (Array.isArray(value)) validValue = value.length > 0
    if (definition?.valueType === 'boolean') validValue = typeof value === 'boolean'
    if (definition?.valueType === 'number')
      validValue =
        typeof value === 'number'
          ? Number.isFinite(value)
          : typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))
    if (definition?.valueType === 'select')
      validValue = definition.options?.some((option) => Object.is(option.value, value)) ?? false
    if (definition?.valueType === 'multi-select')
      validValue = Array.isArray(value) && value.length > 0
    if (!definition || !definition.operators.includes(node.operator) || !validValue)
      invalid.push(node.id)
  }
  return invalid
}
const invalidIds = computed(() => invalidNodeIds(value.value))
const valid = computed(() => invalidIds.value.length === 0)
function apply() {
  if (activeDisabled.value) return
  if (!valid.value) {
    emit('invalid', { ids: invalidIds.value })
    return
  }
  emit('change', cloneGroup(value.value))
}
function reset() {
  if (activeDisabled.value) return
  const previousValue = cloneGroup(value.value)
  const next = cloneGroup(initialValue)
  requestValue(next)
  emit('reset', { previousValue })
}
function add(payload: { parentId: string | number; condition: AvenFilterCondition<Key> }) {
  emit('add', payload)
}
function addGroup(payload: { parentId: string | number; group: AvenFilterGroup<Key> }) {
  emit('addGroup', payload)
}
function remove(payload: { id: string | number }) {
  emit('remove', payload)
}
function focus() {
  root.value?.querySelector<HTMLElement>('select, input, button')?.focus()
}
defineExpose({ apply, reset, focus })
</script>
<template>
  <div
    v-bind="{ ...ui?.root?.attrs, ...rootAttrs }"
    ref="root"
    :id="generatedId"
    role="group"
    :aria-label="label"
    :aria-busy="loading || undefined"
    :class="['aven-filter-builder', attrs.class, { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[attrs.style, ui?.root?.style]"
  >
    <AvenFilterGroupEditor
      :group="value"
      :definitions="definitions"
      :depth="1"
      :max-depth="Math.max(1, maxDepth)"
      :allow-groups="allowGroups"
      :disabled="activeDisabled"
      :unstyled="unstyled"
      :invalid-ids="invalidIds"
      @update:group="setGroup"
      @add="add"
      @add-group="addGroup"
      @remove="remove"
    >
      <template v-if="slots.field" #field="scope"><slot name="field" v-bind="scope" /></template>
      <template v-if="slots.operator" #operator="scope"
        ><slot name="operator" v-bind="scope"
      /></template>
      <template v-if="slots.value" #value="scope"><slot name="value" v-bind="scope" /></template>
      <template v-if="slots.condition" #condition="scope"
        ><slot name="condition" v-bind="scope"
      /></template>
      <template v-if="slots['group-header']" #group-header="scope"
        ><slot name="group-header" v-bind="scope"
      /></template>
      <template v-if="slots['add-action']" #add-action="scope"
        ><slot name="add-action" v-bind="scope"
      /></template>
    </AvenFilterGroupEditor>
    <footer
      :class="['filter-builder-footer', ui?.footer?.class]"
      :style="ui?.footer?.style"
      v-bind="ui?.footer?.attrs"
    >
      <slot name="footer" :apply="apply" :reset="reset" :valid="valid">
        <button
          type="button"
          class="filter-apply"
          :disabled="activeDisabled || !valid"
          @click="apply"
        >
          {{ applyLabel }}
        </button>
        <button type="button" class="filter-reset" :disabled="activeDisabled" @click="reset">
          {{ resetLabel }}
        </button>
        <span v-if="!valid" role="status">Complete or correct the filters before applying.</span>
      </slot>
    </footer>
  </div>
</template>
<style scoped>
.aven-filter-builder {
  display: grid;
  gap: var(--aven-space-3);
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.filter-builder-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
}
.filter-apply,
.filter-reset {
  min-block-size: 2.75rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: inherit;
  font: inherit;
}
.filter-apply:focus-visible,
.filter-reset:focus-visible {
  outline: 2px solid var(--aven-filter-builder-focus, var(--aven-color-focus-ring));
  outline-offset: 2px;
}
.filter-apply:disabled,
.filter-reset:disabled {
  color: var(--aven-color-text-disabled);
}
.is-unstyled .filter-apply,
.is-unstyled .filter-reset {
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>

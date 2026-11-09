<script setup lang="ts" generic="Key extends string = string">
import { computed } from 'vue'
import { useAvenId } from './composables.js'
import type {
  AvenFilterBuilderSlots,
  AvenFilterCondition,
  AvenFilterDefinition,
  AvenFilterGroup,
  AvenFilterNode,
  AvenFilterScalar,
} from './types.js'
const props = defineProps<{
  group: AvenFilterGroup<Key>
  definitions: AvenFilterDefinition[]
  depth: number
  maxDepth: number
  allowGroups: boolean
  disabled: boolean
  unstyled: boolean
  invalidIds: Array<string | number>
}>()
const emit = defineEmits<{
  'update:group': [group: AvenFilterGroup<Key>]
  add: [payload: { parentId: string | number; condition: AvenFilterCondition<Key> }]
  addGroup: [payload: { parentId: string | number; group: AvenFilterGroup<Key> }]
  remove: [payload: { id: string | number }]
}>()
defineSlots<AvenFilterBuilderSlots<Key>>()
const idSeed = useAvenId(undefined, 'filter-node')
let generatedId = 0
function nextId(part: string) {
  generatedId += 1
  return `${idSeed}-${part}-${generatedId}`
}
function isGroup(node: AvenFilterNode<Key>): node is AvenFilterGroup<Key> {
  return 'children' in node
}
function commit(children: AvenFilterNode<Key>[]) {
  emit('update:group', { ...props.group, children })
}
function updateCondition(
  condition: AvenFilterCondition<Key>,
  patch: Partial<Omit<AvenFilterCondition<Key>, 'id'>>,
) {
  if (props.disabled) return
  commit(
    props.group.children.map((node) =>
      !isGroup(node) && Object.is(node.id, condition.id) ? { ...node, ...patch } : node,
    ),
  )
}
function updateNested(id: string | number, next: AvenFilterGroup<Key>) {
  commit(
    props.group.children.map((node) => (isGroup(node) && Object.is(node.id, id) ? next : node)),
  )
}
function updateGroupOperator(operator: 'and' | 'or') {
  if (props.disabled) return
  emit('update:group', { ...props.group, operator })
}
function addCondition() {
  if (props.disabled) return
  const first = props.definitions[0]
  const condition: AvenFilterCondition<Key> = {
    id: nextId('condition'),
    field: (first?.key ?? '') as Key,
    operator: first?.operators[0] ?? '',
    value: '',
  }
  commit([...props.group.children, condition])
  emit('add', { parentId: props.group.id, condition })
}
function addGroup() {
  if (props.disabled || !canAddGroup.value) return
  const group: AvenFilterGroup<Key> = {
    id: nextId('group'),
    operator: 'and',
    children: [],
  }
  commit([...props.group.children, group])
  emit('addGroup', { parentId: props.group.id, group })
}
function removeNode(node: AvenFilterNode<Key>) {
  removeNodeById(node.id)
}
function removeNodeById(id: string | number) {
  if (props.disabled) return
  if (!props.group.children.some((candidate) => Object.is(candidate.id, id))) return
  commit(props.group.children.filter((candidate) => !Object.is(candidate.id, id)))
  emit('remove', { id })
}
const canAddGroup = computed(() => props.allowGroups && props.depth < props.maxDepth)
function updateValue(condition: AvenFilterCondition<Key>, value: AvenFilterScalar) {
  updateCondition(condition, { value })
}
</script>
<template>
  <section
    role="group"
    :aria-label="`Condition group ${depth}`"
    :class="['filter-group-editor', { 'is-unstyled': unstyled }]"
  >
    <header class="group-header">
      <slot name="group-header" :group="group" :depth="depth">
        <strong>Group {{ depth }}</strong>
        <label>
          <span class="visually-hidden">Group {{ depth }} match</span>
          <select
            :value="group.operator"
            :disabled="disabled"
            @change="
              updateGroupOperator(($event.target as HTMLSelectElement).value as 'and' | 'or')
            "
          >
            <option value="and">Match all (AND)</option>
            <option value="or">Match any (OR)</option>
          </select>
        </label>
      </slot>
      <button
        v-if="depth > 1"
        type="button"
        class="remove-condition"
        :disabled="disabled"
        :aria-label="`Remove condition group ${depth}`"
        @click="emit('remove', { id: group.id })"
      >
        Remove group
      </button>
    </header>
    <ol class="condition-list">
      <li v-for="node in group.children" :key="node.id">
        <AvenFilterGroupEditor
          v-if="isGroup(node)"
          :group="node"
          :definitions="definitions"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :allow-groups="allowGroups"
          :disabled="disabled"
          :unstyled="unstyled"
          :invalid-ids="invalidIds"
          @update:group="updateNested(node.id, $event)"
          @add="emit('add', $event)"
          @add-group="emit('addGroup', $event)"
          @remove="removeNodeById($event.id)"
        >
          <template #group-header="scope"><slot name="group-header" v-bind="scope" /></template>
          <template #condition="scope"><slot name="condition" v-bind="scope" /></template>
          <template #field="scope"><slot name="field" v-bind="scope" /></template>
          <template #operator="scope"><slot name="operator" v-bind="scope" /></template>
          <template #value="scope"><slot name="value" v-bind="scope" /></template>
          <template #add-action="scope"><slot name="add-action" v-bind="scope" /></template>
        </AvenFilterGroupEditor>
        <slot
          v-else
          name="condition"
          :condition="node"
          :definition="definitions.find((definition) => definition.key === node.field)"
          :update="
            (patch: Partial<Omit<AvenFilterCondition<Key>, 'id'>>) => updateCondition(node, patch)
          "
          :remove="() => removeNode(node)"
          :invalid="invalidIds.some((id) => Object.is(id, node.id))"
          :error-id="`aven-filter-condition-${node.id}-error`"
        >
          <div class="condition-row">
            <slot
              name="field"
              :condition="node"
              :definitions="definitions"
              :update="(field: Key) => updateCondition(node, { field })"
              :invalid="invalidIds.some((id) => Object.is(id, node.id))"
              :error-id="`aven-filter-condition-${node.id}-error`"
            >
              <label>
                <span class="visually-hidden">Filter field</span>
                <select
                  :value="node.field"
                  :disabled="disabled"
                  :aria-invalid="invalidIds.some((id) => Object.is(id, node.id)) || undefined"
                  :aria-describedby="
                    invalidIds.some((id) => Object.is(id, node.id))
                      ? `aven-filter-condition-${node.id}-error`
                      : undefined
                  "
                  @change="
                    updateCondition(node, {
                      field: ($event.target as HTMLSelectElement).value as Key,
                      operator:
                        definitions.find(
                          (definition) =>
                            definition.key === ($event.target as HTMLSelectElement).value,
                        )?.operators[0] ?? '',
                      value: '',
                    })
                  "
                >
                  <option
                    v-for="definition in definitions"
                    :key="definition.key"
                    :value="definition.key"
                  >
                    {{ definition.label }}
                  </option>
                </select>
              </label>
              <slot
                name="operator"
                :condition="node"
                :definition="definitions.find((definition) => definition.key === node.field)"
                :update="(operator: string) => updateCondition(node, { operator })"
                :invalid="invalidIds.some((id) => Object.is(id, node.id))"
                :error-id="`aven-filter-condition-${node.id}-error`"
              >
                <label>
                  <span class="visually-hidden">Filter operator</span>
                  <select
                    :value="node.operator"
                    :disabled="disabled"
                    :aria-invalid="invalidIds.some((id) => Object.is(id, node.id)) || undefined"
                    :aria-describedby="
                      invalidIds.some((id) => Object.is(id, node.id))
                        ? `aven-filter-condition-${node.id}-error`
                        : undefined
                    "
                    @change="
                      updateCondition(node, {
                        operator: ($event.target as HTMLSelectElement).value,
                      })
                    "
                  >
                    <option
                      v-for="operator in definitions.find(
                        (definition) => definition.key === node.field,
                      )?.operators ?? []"
                      :key="operator"
                      :value="operator"
                    >
                      {{ operator }}
                    </option>
                  </select>
                </label>
              </slot>
              <slot
                name="value"
                :condition="node"
                :definition="definitions.find((definition) => definition.key === node.field)"
                :update="(value: AvenFilterScalar) => updateValue(node, value)"
                :invalid="invalidIds.some((id) => Object.is(id, node.id))"
                :error-id="`aven-filter-condition-${node.id}-error`"
              >
                <FilterValueEditor
                  :condition="node"
                  :definition="definitions.find((definition) => definition.key === node.field)"
                  :disabled="disabled"
                  :invalid="invalidIds.some((id) => Object.is(id, node.id))"
                  :error-id="`aven-filter-condition-${node.id}-error`"
                  @update="updateValue(node, $event)"
                />
              </slot>
            </slot>
            <button
              type="button"
              class="remove-condition"
              :disabled="disabled"
              @click="removeNode(node)"
            >
              Remove condition
            </button>
          </div>
        </slot>
        <p
          v-if="!isGroup(node) && invalidIds.some((id) => Object.is(id, node.id))"
          :id="`aven-filter-condition-${node.id}-error`"
          class="condition-error"
        >
          Complete or correct this condition before applying.
        </p>
      </li>
    </ol>
    <footer class="group-actions">
      <slot
        name="add-action"
        :group="group"
        :add-condition="addCondition"
        :add-group="addGroup"
        :can-add-group="canAddGroup"
        :disabled="disabled"
      >
        <button
          type="button"
          aria-label="Add condition"
          :disabled="disabled || !definitions.length"
          @click="addCondition"
        >
          Add condition
        </button>
        <button v-if="canAddGroup" type="button" :disabled="disabled" @click="addGroup">
          Add group
        </button>
      </slot>
    </footer>
  </section>
</template>

<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'
import type {
  AvenFilterCondition as FilterConditionModel,
  AvenFilterDefinition as FilterDefinitionModel,
  AvenFilterScalar as FilterScalarModel,
} from './types.js'
const FilterValueEditor = defineComponent({
  props: {
    condition: { type: Object as PropType<FilterConditionModel>, required: true },
    definition: { type: Object as PropType<FilterDefinitionModel>, default: undefined },
    disabled: Boolean,
    invalid: Boolean,
    errorId: { type: String, default: undefined },
  },
  emits: { update: (_value: FilterScalarModel) => true },
  setup(props, { emit }) {
    const value = () => props.condition.value
    const options = () => props.definition?.options ?? []
    const optionValue = (raw: string) =>
      options().find((option) => String(option.value) === raw)?.value ?? raw
    const input = (type: string) =>
      h('input', {
        type,
        value: value() === null ? '' : String(value()),
        disabled: props.disabled,
        'aria-invalid': props.invalid || undefined,
        'aria-describedby': props.invalid ? props.errorId : undefined,
        onInput: (event: Event) => emit('update', (event.target as HTMLInputElement).value),
      })
    if (props.definition?.valueType === 'boolean')
      return () =>
        h('input', {
          type: 'checkbox',
          checked: value() === true,
          disabled: props.disabled,
          'aria-invalid': props.invalid || undefined,
          'aria-describedby': props.invalid ? props.errorId : undefined,
          onChange: (event: Event) => emit('update', (event.target as HTMLInputElement).checked),
        })
    if (props.definition?.valueType === 'select')
      return () =>
        h(
          'select',
          {
            value: String(value() ?? ''),
            disabled: props.disabled,
            'aria-invalid': props.invalid || undefined,
            'aria-describedby': props.invalid ? props.errorId : undefined,
            onChange: (event: Event) =>
              emit('update', optionValue((event.target as HTMLSelectElement).value)),
          },
          [
            h('option', { value: '', disabled: true }, 'Select value'),
            ...options().map((option) =>
              h('option', { key: String(option.value), value: String(option.value) }, option.label),
            ),
          ],
        )
    if (props.definition?.valueType === 'multi-select')
      return () =>
        h(
          'select',
          {
            multiple: true,
            value: Array.isArray(value()) ? (value() as Array<string | number>).map(String) : [],
            disabled: props.disabled,
            'aria-invalid': props.invalid || undefined,
            'aria-describedby': props.invalid ? props.errorId : undefined,
            onChange: (event: Event) =>
              emit(
                'update',
                Array.from((event.target as HTMLSelectElement).selectedOptions, (option) =>
                  optionValue(option.value),
                ),
              ),
          },
          options().map((option) =>
            h('option', { key: String(option.value), value: String(option.value) }, option.label),
          ),
        )
    return () =>
      input(
        props.definition?.valueType === 'number'
          ? 'number'
          : props.definition?.valueType === 'date'
            ? 'date'
            : 'text',
      )
  },
})
export default defineComponent({
  name: 'AvenFilterGroupEditor',
  components: { FilterValueEditor },
})
</script>
<style scoped>
.filter-group-editor {
  display: grid;
  gap: var(--aven-space-2);
  min-inline-size: 0;
  padding: var(--aven-space-3);
  border: 0.0625rem solid var(--aven-filter-builder-border, var(--aven-color-border-subtle));
  border-inline-start-width: 0.1875rem;
  border-radius: var(--aven-radius-sm);
  background: var(--aven-filter-builder-bg, var(--aven-color-surface-subtle));
}
.group-header,
.condition-row,
.group-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  min-inline-size: 0;
}
.condition-list {
  display: grid;
  gap: var(--aven-space-2);
  margin: 0;
  padding-inline-start: var(--aven-space-4);
  list-style: none;
}
.condition-list > li {
  min-inline-size: 0;
}
.condition-error {
  margin: var(--aven-space-1) 0 0;
  color: var(--aven-filter-error-fg, var(--aven-color-text-danger, var(--aven-color-text-primary)));
  font-size: var(--aven-font-size-sm);
}
.condition-row select,
.group-header select,
.group-actions button,
.remove-condition {
  min-block-size: 2.75rem;
  max-inline-size: 100%;
  padding-inline: var(--aven-space-2);
  border: 0.0625rem solid var(--aven-filter-builder-border, var(--aven-color-border-subtle));
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-card);
  color: var(--aven-color-text-primary);
  font: inherit;
}
.condition-row input,
.condition-row select {
  min-inline-size: 7rem;
}
.condition-row select[multiple] {
  min-block-size: 5rem;
}
.condition-row input[type='checkbox'] {
  inline-size: 1.25rem;
  min-inline-size: 1.25rem;
}
.condition-row [aria-invalid='true'] {
  border-color: var(
    --aven-filter-builder-invalid-border,
    var(--aven-color-border-danger, var(--aven-color-border-subtle))
  );
}
.condition-row > button {
  margin-inline-start: auto;
}
.group-actions {
  justify-content: flex-start;
}
.visually-hidden {
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
.filter-group-editor:focus-within select:focus-visible,
.filter-group-editor:focus-within button:focus-visible,
.condition-row input:focus-visible {
  outline: 0.125rem solid var(--aven-filter-builder-focus, var(--aven-color-focus-ring));
  outline-offset: 0.125rem;
}
.is-unstyled {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.is-unstyled .condition-row select,
.is-unstyled .group-header select,
.is-unstyled .group-actions button,
.is-unstyled .remove-condition {
  border: 0;
  border-radius: 0;
  background: transparent;
}
@media (forced-colors: active) {
  .filter-group-editor,
  .condition-row select,
  .group-header select,
  .group-actions button,
  .remove-condition {
    border-color: CanvasText;
  }
}
</style>

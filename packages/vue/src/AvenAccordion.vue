<script setup lang="ts" generic="Key extends string | number">
import { computed, ref, shallowRef, watch } from 'vue'
import type {
  AvenAccordionEvents,
  AvenAccordionItem,
  AvenAccordionProps,
  AvenAccordionSlots,
} from './types.js'
import { useAvenId } from './composables.js'
const props = withDefaults(defineProps<AvenAccordionProps<Key>>(), {
  defaultValue: null,
  multiple: false,
  collapsible: true,
  lazy: true,
  unmountOnHide: false,
  unstyled: false,
})
const emit = defineEmits<AvenAccordionEvents<Key>>()
defineSlots<AvenAccordionSlots<Key>>()
const local = shallowRef<Key | Key[] | null>(props.defaultValue ?? null),
  opened = computed(() => (props.modelValue !== undefined ? props.modelValue : local.value)),
  headers = ref<HTMLButtonElement[]>([]),
  visited = shallowRef(
    new Set<Key>(
      Array.isArray(opened.value) ? opened.value : opened.value === null ? [] : [opened.value],
    ),
  )
watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) local.value = value
  },
)
function isOpen(key: Key) {
  return Array.isArray(opened.value)
    ? opened.value.some((item) => Object.is(item, key))
    : Object.is(opened.value, key)
}
function toggle(key: Key) {
  const item = props.items.find((option) => Object.is(option.key, key))
  if (!item || item.disabled) return
  let next: Key | Key[] | null
  if (props.multiple) {
    const current = Array.isArray(opened.value)
      ? opened.value
      : opened.value === null
        ? []
        : [opened.value]
    const exists = current.some((value) => Object.is(value, key))
    if (exists && !props.collapsible && current.length === 1) return
    next = exists ? current.filter((value) => !Object.is(value, key)) : [...current, key]
  } else {
    if (isOpen(key) && !props.collapsible) return
    next = isOpen(key) ? null : key
  }
  if (Array.isArray(next)) next.forEach((value) => visited.value.add(value))
  else if (next !== null) visited.value.add(next)
  local.value = next
  emit('update:modelValue', next)
  emit('change', next)
}
function keydown(e: KeyboardEvent, index: number) {
  let target = -1
  if (e.key === 'ArrowDown') target = index + 1
  else if (e.key === 'ArrowUp') target = index - 1
  else if (e.key === 'Home') target = 0
  else if (e.key === 'End') target = props.items.length - 1
  if (target >= 0) {
    e.preventDefault()
    const available = props.items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled)
    if (available.length) {
      const next = available.find((x) => x.i >= target) ?? available[available.length - 1]
      headers.value[next.i]?.focus()
    }
  }
}
const generatedId = useAvenId(undefined, 'accordion'),
  base = computed(() => props.id ?? generatedId)
function triggerAttrs(item: AvenAccordionItem<Key>, index: number) {
  return {
    id: `${base.value}-trigger-${index}`,
    type: 'button' as const,
    disabled: item.disabled,
    'aria-expanded': isOpen(item.key),
    'aria-controls': `${base.value}-panel-${index}`,
    onClick: () => toggle(item.key),
    onKeydown: (event: KeyboardEvent) => keydown(event, index),
  }
}
function setTrigger(index: number, el: HTMLElement | null) {
  if (el instanceof HTMLButtonElement) headers.value[index] = el
}
</script>
<template>
  <div
    v-bind="ui?.root?.attrs"
    :class="['aven-accordion', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <section
      v-bind="ui?.item?.attrs"
      v-for="(item, index) in items"
      :key="item.key"
      :class="[
        'accordion-item',
        { 'is-open': isOpen(item.key), 'is-disabled': item.disabled },
        ui?.item?.class,
      ]"
      :style="ui?.item?.style"
    >
      <h3 class="accordion-heading">
        <slot
          name="trigger"
          :item="item"
          :open="isOpen(item.key)"
          :disabled="!!item.disabled"
          :trigger-attrs="triggerAttrs(item, index)"
          :trigger-ref="(el: HTMLElement | null) => setTrigger(index, el)"
          ><button
            v-bind="{ ...ui?.trigger?.attrs, ...triggerAttrs(item, index) }"
            :ref="(el) => setTrigger(index, el as HTMLElement | null)"
            :class="['accordion-trigger', ui?.trigger?.class]"
            :style="ui?.trigger?.style"
          >
            <slot name="leading" :item="item" /><span>{{ item.label }}</span
            ><slot name="trailing" :item="item" /><slot name="indicator" :open="isOpen(item.key)"
              ><span class="chevron" aria-hidden="true">{{
                isOpen(item.key) ? '−' : '+'
              }}</span></slot
            >
          </button></slot
        >
      </h3>
      <div
        v-bind="ui?.panel?.attrs"
        v-if="!unmountOnHide && (isOpen(item.key) || !lazy || visited.has(item.key))"
        :id="`${base}-panel-${index}`"
        role="region"
        :aria-labelledby="`${base}-trigger-${index}`"
        :hidden="!isOpen(item.key)"
        :class="['accordion-panel', ui?.panel?.class]"
        :style="ui?.panel?.style"
      >
        <slot name="content" :item="item" :open="isOpen(item.key)" />
      </div>
      <div
        v-bind="ui?.panel?.attrs"
        v-else-if="unmountOnHide && isOpen(item.key)"
        :id="`${base}-panel-${index}`"
        role="region"
        :aria-labelledby="`${base}-trigger-${index}`"
        :class="['accordion-panel', ui?.panel?.class]"
        :style="ui?.panel?.style"
      >
        <slot name="content" :item="item" :open="true" />
      </div>
    </section>
  </div>
</template>
<style scoped>
.aven-accordion {
  display: flex;
  flex-direction: column;
  border-block-start: 1px solid var(--aven-color-border-subtle);
  color: var(--aven-color-text-primary);
}
.accordion-item {
  border-block-end: 1px solid var(--aven-color-border-subtle);
}
.accordion-heading {
  margin: 0;
  font-size: inherit;
}
.accordion-trigger {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  width: 100%;
  min-block-size: 3rem;
  padding: var(--aven-space-3) var(--aven-space-4);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.accordion-trigger:hover {
  background: var(--aven-color-surface-hover);
}
.accordion-trigger:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: -2px;
}
.accordion-trigger:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.chevron {
  margin-inline-start: auto;
}
.accordion-panel {
  padding: var(--aven-space-4);
  overflow-wrap: anywhere;
}
.is-unstyled,
.is-unstyled .accordion-item {
  border: 0;
}
.is-unstyled .accordion-trigger {
  padding-inline: 0;
  background: transparent;
}
.is-unstyled .accordion-panel {
  padding: 0;
}
</style>

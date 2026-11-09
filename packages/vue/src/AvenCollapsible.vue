<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { AvenCollapsibleEvents, AvenCollapsibleProps, AvenCollapsibleSlots } from './types.js'
import { useAvenId } from './composables.js'

const props = withDefaults(defineProps<AvenCollapsibleProps>(), {
  open: undefined,
  defaultOpen: false,
  disabled: false,
  lazy: true,
  unmountOnHide: false,
  unstyled: false,
})
const emit = defineEmits<AvenCollapsibleEvents>()
defineSlots<AvenCollapsibleSlots>()
const localOpen = ref(props.defaultOpen)
const isOpen = computed(() => (props.open === undefined ? localOpen.value : props.open))
const wasOpened = ref(isOpen.value)
const trigger = ref<HTMLButtonElement>()
const generatedId = useAvenId(undefined, 'collapsible')
const baseId = computed(() => props.id ?? generatedId)
const contentId = computed(() => `${baseId.value}-content`)
watch(
  () => props.open,
  (value) => {
    if (value !== undefined) localOpen.value = value
  },
)
watch(isOpen, async (value, previous) => {
  if (value) wasOpened.value = true
  await nextTick()
  if (value) emit('afterOpen')
  else emit('afterClose')
  if (
    !value &&
    trigger.value &&
    document.activeElement &&
    !trigger.value.parentElement?.contains(document.activeElement)
  )
    return
  void previous
})
function toggle() {
  if (props.disabled) return
  const next = !isOpen.value
  localOpen.value = next
  emit('update:open', next)
  emit('openChange', next)
}
function setTrigger(el: unknown) {
  if (el && typeof el === 'object' && 'tagName' in el && el.tagName === 'BUTTON')
    trigger.value = el as HTMLButtonElement
}
function triggerAttrs() {
  return {
    id: `${baseId.value}-trigger`,
    type: 'button' as const,
    disabled: props.disabled,
    'aria-expanded': isOpen.value,
    'aria-controls': contentId.value,
    onClick: toggle,
  }
}
</script>

<template>
  <section
    v-bind="ui?.root?.attrs"
    :class="[
      'aven-collapsible',
      { 'is-open': isOpen, 'is-disabled': disabled, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
  >
    <h3 class="collapsible-heading">
      <slot
        name="trigger"
        :open="isOpen"
        :disabled="disabled"
        :trigger-attrs="triggerAttrs()"
        :trigger-ref="setTrigger"
      >
        <button
          v-bind="{ ...ui?.trigger?.attrs, ...triggerAttrs() }"
          :ref="setTrigger"
          :class="['collapsible-trigger', ui?.trigger?.class]"
          :style="ui?.trigger?.style"
        >
          <slot name="leading" /><slot /><slot name="indicator" :open="isOpen"
            ><span class="chevron" aria-hidden="true">{{ isOpen ? '−' : '+' }}</span></slot
          ><slot name="trailing" />
        </button>
      </slot>
    </h3>
    <div
      v-bind="ui?.panel?.attrs"
      v-if="!unmountOnHide && (isOpen || !lazy || wasOpened)"
      :id="contentId"
      :hidden="!isOpen"
      role="region"
      :aria-labelledby="`${baseId}-trigger`"
      :class="['collapsible-panel', ui?.panel?.class]"
      :style="ui?.panel?.style"
    >
      <slot name="content" :open="isOpen"><slot name="panel" :open="isOpen" /></slot>
    </div>
    <div
      v-bind="ui?.panel?.attrs"
      v-else-if="unmountOnHide && isOpen"
      :id="contentId"
      role="region"
      :aria-labelledby="`${baseId}-trigger`"
      :class="['collapsible-panel', ui?.panel?.class]"
      :style="ui?.panel?.style"
    >
      <slot name="content" :open="true"><slot name="panel" :open="true" /></slot>
    </div>
  </section>
</template>

<style scoped>
.aven-collapsible {
  min-inline-size: 0;
  color: var(--aven-color-text-primary);
}
.collapsible-heading {
  margin: 0;
  font: inherit;
}
.collapsible-trigger {
  display: flex;
  align-items: center;
  gap: var(--aven-space-3);
  inline-size: 100%;
  min-block-size: 2.75rem;
  padding: var(--aven-space-3) var(--aven-space-4);
  border: 0.0625rem solid var(--aven-color-border-subtle);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-card);
  color: inherit;
  text-align: start;
  font: inherit;
  cursor: pointer;
}
.collapsible-trigger:focus-visible {
  outline: 0.125rem solid var(--aven-color-focus-ring);
  outline-offset: 0.125rem;
}
.collapsible-trigger:disabled {
  color: var(--aven-color-text-disabled);
  cursor: not-allowed;
}
.chevron {
  margin-inline-start: auto;
}
.collapsible-panel {
  padding: var(--aven-space-4);
  overflow-wrap: anywhere;
}
.is-unstyled .collapsible-trigger {
  padding-inline: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.is-unstyled .collapsible-panel {
  padding: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .collapsible-panel {
    animation: reveal 120ms ease-out;
  }
}
@keyframes reveal {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}
@media (forced-colors: active) {
  .collapsible-trigger {
    border: 0.0625rem solid ButtonText;
  }
}
</style>

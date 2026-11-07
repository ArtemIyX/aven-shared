<script setup lang="ts" generic="Key extends string | number">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AvenMenu from './AvenMenu.vue'
import type { AvenCommand, AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    items: AvenCommand<Key>[]
    open?: boolean
    defaultOpen?: boolean
    placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
    offset?: number
    closeOnSelect?: boolean
    disabled?: boolean
    matchTriggerWidth?: boolean
    label?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'trigger' | 'content'>
  }>(),
  {
    placement: 'bottom-start',
    offset: 4,
    closeOnSelect: true,
    disabled: false,
    matchTriggerWidth: false,
    label: 'Actions',
    unstyled: false,
  },
)
const emit = defineEmits<{
  'update:open': [open: boolean]
  openChange: [
    change: { open: boolean; reason: 'trigger' | 'select' | 'escape' | 'outside' | 'programmatic' },
  ]
  select: [payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }]
}>()
const local = ref(props.defaultOpen ?? false),
  isOpen = computed(() => (props.open === undefined ? local.value : props.open)),
  root = ref<HTMLElement>(),
  trigger = ref<HTMLElement>(),
  menu = ref<{ focusFirst: () => void } | null>()
function setOpen(
  next: boolean,
  reason: 'trigger' | 'select' | 'escape' | 'outside' | 'programmatic',
) {
  if (isOpen.value === next) return
  if (props.open === undefined) local.value = next
  emit('update:open', next)
  emit('openChange', { open: next, reason })
}
function toggle() {
  if (!props.disabled) setOpen(!isOpen.value, 'trigger')
}
function outside(e: PointerEvent) {
  if (isOpen.value && !root.value?.contains(e.target as Node)) setOpen(false, 'outside')
}
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    e.stopPropagation()
    setOpen(false, 'escape')
    trigger.value?.focus()
  }
}
watch(isOpen, async (value) => {
  if (value) {
    if (typeof document !== 'undefined') document.addEventListener('pointerdown', outside, true)
    await nextTick()
    menu.value?.focusFirst()
  } else if (typeof document !== 'undefined')
    document.removeEventListener('pointerdown', outside, true)
})
onMounted(() => {
  if (isOpen.value) {
    if (typeof document !== 'undefined') document.addEventListener('pointerdown', outside, true)
    void nextTick(() => menu.value?.focusFirst())
  }
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', outside, true)
})
function select(payload: { key: Key; item: AvenCommand<Key>; originalEvent: Event }) {
  emit('select', payload)
  if (props.closeOnSelect) {
    setOpen(false, 'select')
    void nextTick(() => trigger.value?.focus())
  }
}
const triggerAttrs = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  disabled: props.disabled,
  onClick: toggle,
  onKeydown: (e: KeyboardEvent) => {
    if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && !isOpen.value) {
      e.preventDefault()
      setOpen(true, 'trigger')
    }
  },
}))
function setTrigger(el: unknown) {
  trigger.value =
    el && typeof el === 'object' && 'focus' in el && typeof el.focus === 'function'
      ? (el as HTMLElement)
      : undefined
}
</script>
<template>
  <span
    ref="root"
    :class="[
      'aven-dropdown-menu',
      `place-${placement}`,
      { 'is-open': isOpen, 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="[
      {
        '--aven-menu-offset': `${offset}px`,
        ...(matchTriggerWidth ? { '--aven-menu-width': '100%' } : {}),
      },
      ui?.root?.style,
    ]"
    @keydown.capture="keydown"
    ><slot name="trigger" :trigger-attrs="triggerAttrs" :trigger-ref="setTrigger" :open="isOpen"
      ><button
        ref="trigger"
        type="button"
        v-bind="triggerAttrs"
        :class="['dropdown-trigger', ui?.trigger?.class]"
        :style="ui?.trigger?.style"
      >
        {{ label }}
      </button></slot
    >
    <div
      v-bind="ui?.content?.attrs"
      v-if="isOpen"
      :class="['dropdown-content', ui?.content?.class]"
      :style="ui?.content?.style"
    >
      <AvenMenu ref="menu" :items="items" @select="select"
        ><template #item="scope"
          ><slot name="item" v-bind="scope">{{ scope.item.label }}</slot></template
        ><template #header><slot name="header" /></template
        ><template #footer><slot name="footer" /></template
        ><template #empty><slot name="empty">No actions</slot></template></AvenMenu
      >
    </div></span
  >
</template>
<style scoped>
.aven-dropdown-menu {
  position: relative;
  display: inline-flex;
}
.dropdown-trigger {
  min-block-size: 2.25rem;
  padding-inline: var(--aven-space-3);
  border: 1px solid var(--aven-color-border-interactive);
  border-radius: var(--aven-radius-md);
  background: var(--aven-color-surface-base);
  color: var(--aven-color-text-primary);
  font: inherit;
  cursor: pointer;
}
.dropdown-trigger:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.dropdown-content {
  position: absolute;
  z-index: 950;
  inline-size: var(--aven-menu-width, max-content);
  min-inline-size: 12rem;
  max-inline-size: calc(100vw - 1rem);
  inset-block-start: calc(100% + var(--aven-menu-offset));
  inset-inline-start: 0;
}
.place-bottom-end .dropdown-content,
.place-top-end .dropdown-content {
  inset-inline-start: auto;
  inset-inline-end: 0;
}
.place-top-start .dropdown-content,
.place-top-end .dropdown-content {
  inset-block-start: auto;
  inset-block-end: calc(100% + var(--aven-menu-offset));
}
.is-unstyled .dropdown-trigger {
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  padding: 0;
}
</style>

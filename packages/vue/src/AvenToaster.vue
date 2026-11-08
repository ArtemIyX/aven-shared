<script setup lang="ts" generic="Key extends string | number = string | number">
import { computed, useAttrs } from 'vue'
import AvenToast from './AvenToast.vue'
import type {
  AvenToastKey,
  AvenToasterEvents,
  AvenToasterProps,
  AvenToasterSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenToasterProps<Key>>(), {
  position: 'bottom-end',
  maxVisible: 3,
  gap: '0.75rem',
  pauseOnHover: true,
  pauseOnFocus: true,
  unstyled: false,
})
const emit = defineEmits<AvenToasterEvents<Key>>()
defineSlots<AvenToasterSlots<Key>>()
const attrs = useAttrs()
type ToastInstance = { dismiss: () => void; $el?: HTMLElement }
const instances = new Map<Key, ToastInstance>()
const domKeys = new Map<string, Key>()
const visibleItems = computed(() => props.items.slice(0, Math.max(0, props.maxVisible)))
const domKey = (id: AvenToastKey) => `${typeof id}:${id}`

function setToastRef(id: Key, instance: ToastInstance | null) {
  if (instance) {
    instances.set(id, instance)
    domKeys.set(domKey(id), id)
  } else {
    instances.delete(id)
  }
}
function dismissItem(id: Key) {
  return () => instances.get(id)?.dismiss()
}
function afterLeave(element: Element) {
  const encoded = element.getAttribute('data-toast-key')
  if (!encoded) return
  const id = domKeys.get(encoded)
  if (id === undefined) return
  domKeys.delete(encoded)
  emit('afterClose', { id })
}
</script>

<template>
  <TransitionGroup
    tag="div"
    name="aven-toast"
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :aria-label="attrs['aria-label'] ?? 'Notifications'"
    :class="[
      'aven-toaster',
      `position-${props.position}`,
      { 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[{ '--aven-toaster-gap': props.gap }, attrs.style, props.ui?.root?.style]"
    @after-leave="afterLeave"
  >
    <AvenToast
      v-for="item in visibleItems"
      :key="item.id"
      :ref="(instance) => setToastRef(item.id, instance as ToastInstance | null)"
      v-bind="item"
      :pause-on-hover="props.pauseOnHover"
      :pause-on-focus="props.pauseOnFocus"
      :unstyled="props.unstyled"
      :ui="props.ui?.toast ? { root: props.ui.toast } : undefined"
      @dismiss="emit('dismiss', $event)"
      @action="emit('action', $event)"
    >
      <template v-if="$slots.toast" #default>
        <slot name="toast" :item="item" :dismiss="dismissItem(item.id)" />
      </template>
    </AvenToast>
  </TransitionGroup>
</template>

<style scoped>
.aven-toaster {
  position: fixed;
  z-index: var(--aven-z-toast, 1000);
  display: grid;
  gap: var(--aven-toaster-gap);
  inline-size: min(26rem, calc(100vw - 2rem));
  max-block-size: min(80vh, 48rem);
  overflow: auto;
  padding: max(env(safe-area-inset-top), 0.5rem) max(env(safe-area-inset-right), 0.5rem)
    max(env(safe-area-inset-bottom), 0.5rem) max(env(safe-area-inset-left), 0.5rem);
  pointer-events: none;
  overscroll-behavior: contain;
}
.aven-toaster :deep(.aven-toast) {
  inline-size: 100%;
  pointer-events: auto;
}
.position-top-start {
  inset-block-start: 0;
  inset-inline-start: 0;
}
.position-top-center {
  inset-block-start: 0;
  inset-inline: 0;
  margin-inline: auto;
}
.position-top-end {
  inset-block-start: 0;
  inset-inline-end: 0;
}
.position-bottom-start {
  inset-block-end: 0;
  inset-inline-start: 0;
}
.position-bottom-center {
  inset-block-end: 0;
  inset-inline: 0;
  margin-inline: auto;
}
.position-bottom-end {
  inset-block-end: 0;
  inset-inline-end: 0;
}
.aven-toast-enter-active,
.aven-toast-leave-active,
.aven-toast-move {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.aven-toast-enter-from,
.aven-toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
.position-top-start .aven-toast-enter-from,
.position-top-center .aven-toast-enter-from,
.position-top-end .aven-toast-enter-from {
  transform: translateY(-0.5rem);
}
.is-unstyled {
  overflow: visible;
  padding: 0;
}
@media (prefers-reduced-motion: reduce) {
  .aven-toast-enter-active,
  .aven-toast-leave-active,
  .aven-toast-move {
    transition: none;
  }
}
@media print {
  .aven-toaster {
    position: static;
    inline-size: 100%;
    max-block-size: none;
    overflow: visible;
    padding: 0;
  }
  .aven-toast-enter-active,
  .aven-toast-leave-active {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AvenAvatarEvents, AvenAvatarProps, AvenAvatarSlots } from './types.js'
const props = withDefaults(defineProps<AvenAvatarProps>(), {
  size: 'md',
  shape: 'circle',
  loading: 'lazy',
  unstyled: false,
})
const emit = defineEmits<AvenAvatarEvents>()
defineSlots<AvenAvatarSlots>()
const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
const initials = computed(
  () =>
    props.initials ??
    (props.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => Array.from(part)[0]?.toLocaleUpperCase() ?? '')
      .join(''),
)
function onError(e: Event) {
  failed.value = true
  emit('error', e)
}
</script>
<template>
  <span
    v-bind="ui?.root?.attrs"
    :role="src && !failed ? undefined : alt === '' ? undefined : 'img'"
    :aria-label="src && !failed ? undefined : (alt ?? name ?? (initials || undefined))"
    :class="[
      'aven-avatar',
      `size-${size}`,
      `shape-${shape}`,
      { 'is-unstyled': unstyled },
      ui?.root?.class,
    ]"
    :style="ui?.root?.style"
    ><img
      v-if="src && !failed"
      v-bind="ui?.image?.attrs"
      :src="src"
      :alt="alt ?? name ?? ''"
      :loading="loading"
      :class="ui?.image?.class"
      :style="ui?.image?.style"
      @load="emit('load', $event)"
      @error="onError" /><span
      v-else
      v-bind="ui?.fallback?.attrs"
      :aria-hidden="alt === '' || undefined"
      :class="['avatar-fallback', ui?.fallback?.class]"
      :style="ui?.fallback?.style"
      ><slot name="fallback" :name="name" :initials="initials">{{
        initials || name?.trim().slice(0, 1).toLocaleUpperCase() || '?'
      }}</slot></span
    ><span
      v-if="$slots.status"
      v-bind="ui?.status?.attrs"
      :class="['avatar-status', ui?.status?.class]"
      :style="ui?.status?.style"
      ><slot name="status" /></span
  ></span>
</template>
<style scoped>
.aven-avatar {
  position: relative;
  display: inline-grid;
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  flex: none;
  overflow: hidden;
  border: 1px solid var(--aven-color-border-subtle);
  background: var(--aven-color-surface-recessed);
  color: var(--aven-color-text-secondary);
  font-weight: 600;
  vertical-align: middle;
}
.aven-avatar img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}
.avatar-fallback {
  display: grid;
  place-items: center;
  inline-size: 100%;
  block-size: 100%;
  background: var(--aven-color-surface-selected);
  color: var(--aven-color-text-primary);
}
.shape-circle {
  border-radius: 50%;
}
.shape-rounded {
  border-radius: var(--aven-radius-md);
}
.shape-square {
  border-radius: 0;
}
.size-xs {
  inline-size: 1.5rem;
  block-size: 1.5rem;
  font-size: var(--aven-font-size-xs);
}
.size-sm {
  inline-size: 2rem;
  block-size: 2rem;
  font-size: var(--aven-font-size-sm);
}
.size-lg {
  inline-size: 3rem;
  block-size: 3rem;
  font-size: var(--aven-font-size-lg);
}
.size-xl {
  inline-size: 4rem;
  block-size: 4rem;
  font-size: var(--aven-font-size-xl);
}
.avatar-status {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
  display: grid;
  place-items: center;
  min-inline-size: 0.6rem;
  min-block-size: 0.6rem;
  border: 2px solid var(--aven-color-surface-base);
  border-radius: 50%;
  background: var(--aven-color-success-solid);
}
.is-unstyled {
  border: 0;
  border-radius: 0;
  background: transparent;
}
</style>

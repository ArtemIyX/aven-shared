<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { AvenLinkEvents, AvenLinkProps, AvenLinkSlots } from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenLinkProps>(), {
  underline: 'hover',
  variant: 'default',
  external: false,
  unstyled: false,
})
const emit = defineEmits<AvenLinkEvents>()
defineSlots<AvenLinkSlots>()
const attrs = useAttrs()
const rel = computed(
  () => props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined),
)
const linkStyle = computed(() => [attrs.style, props.ui?.root?.style])
const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return { ...rest, ...props.ui?.root?.attrs }
})
function onClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <a
    v-bind="{ ...ui?.root?.attrs, ...forwardedAttrs }"
    :href="href"
    :target="target"
    :rel="rel"
    :download="download"
    :class="[
      'aven-link',
      `underline-${underline}`,
      `variant-${variant}`,
      tone && `tone-${tone}`,
      { 'is-unstyled': unstyled },
      attrs.class,
      ui?.root?.class,
    ]"
    :style="linkStyle"
    @click="onClick"
  >
    <span
      v-if="$slots.leading"
      v-bind="ui?.leading?.attrs"
      :class="['link-leading', ui?.leading?.class]"
      :style="ui?.leading?.style"
      ><slot name="leading"
    /></span>
    <slot />
    <span
      v-if="$slots.trailing || external"
      v-bind="ui?.trailing?.attrs"
      :class="['link-trailing', ui?.trailing?.class]"
      :style="ui?.trailing?.style"
    >
      <slot name="trailing"><span v-if="external" aria-hidden="true">↗</span></slot>
    </span>
  </a>
</template>

<style scoped>
.aven-link {
  --link-default-color: var(--aven-color-link-default);
  --link-default-hover-color: var(--aven-color-link-hover);
  --link-default-pressed-color: var(--aven-color-link-pressed);
  --link-default-visited-color: var(--aven-color-link-visited);
  display: inline-flex;
  align-items: baseline;
  gap: var(--aven-link-gap, 0.25em);
  color: var(--aven-link-color, var(--link-default-color));
  text-underline-offset: var(--aven-link-underline-offset, 0.15em);
  text-decoration-thickness: var(--aven-link-underline-thickness, 0.08em);
  overflow-wrap: anywhere;
}
.aven-link.variant-subtle {
  --link-default-color: var(--aven-color-text-secondary);
}
.variant-standalone {
  font-weight: 600;
}
.tone-neutral {
  --link-default-color: var(--aven-color-neutral-text);
  --link-default-hover-color: var(--aven-color-neutral-solid);
}
.tone-accent {
  --link-default-color: var(--aven-color-accent-text);
  --link-default-hover-color: var(--aven-color-accent-solid);
}
.tone-secondary {
  --link-default-color: var(--aven-color-secondary-text);
  --link-default-hover-color: var(--aven-color-secondary-solid);
}
.tone-info {
  --link-default-color: var(--aven-color-info-text);
  --link-default-hover-color: var(--aven-color-info-solid);
}
.tone-success {
  --link-default-color: var(--aven-color-success-text);
  --link-default-hover-color: var(--aven-color-success-solid);
}
.tone-warning {
  --link-default-color: var(--aven-color-warning-text);
  --link-default-hover-color: var(--aven-color-warning-solid);
}
.tone-danger,
.tone-critical {
  --link-default-color: var(--aven-color-danger-text);
  --link-default-hover-color: var(--aven-color-danger-solid);
}
.underline-hover {
  text-decoration: none;
}
.underline-hover:hover,
.underline-always {
  text-decoration: underline;
}
.underline-none {
  text-decoration: none;
}
.aven-link:hover {
  color: var(--aven-link-hover-color, var(--link-default-hover-color));
}
.aven-link:active {
  color: var(--aven-link-pressed-color, var(--link-default-pressed-color));
}
.aven-link:visited {
  color: var(--aven-link-visited-color, var(--aven-link-color, var(--link-default-color)));
}
.aven-link:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--aven-radius-sm);
}
.is-unstyled {
  color: inherit;
  text-decoration: none;
}
@media (forced-colors: active) {
  .aven-link:focus-visible {
    outline-color: LinkText;
  }
}
</style>

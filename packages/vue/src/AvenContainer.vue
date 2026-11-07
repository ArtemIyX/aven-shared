<script setup lang="ts">
import type { AvenUi } from './types.js'
withDefaults(
  defineProps<{
    as?: 'div' | 'main' | 'section' | 'article'
    maxWidth?: string
    gutter?: string | number
    centered?: boolean
    unstyled?: boolean
    ui?: AvenUi<'root'>
  }>(),
  { as: 'div', maxWidth: '72rem', gutter: 'space-4', centered: true, unstyled: false },
)
function gapValue(value: string | number): string {
  return typeof value === 'number'
    ? `${value}px`
    : value.startsWith('space-')
      ? `var(--aven-${value})`
      : value
}
</script>
<template>
  <component
    :is="as"
    :class="['aven-container', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="[
      {
        maxInlineSize: unstyled ? 'none' : maxWidth,
        paddingInline: unstyled ? 0 : gapValue(gutter),
        marginInline: centered ? 'auto' : undefined,
      },
      ui?.root?.style,
    ]"
    ><slot
  /></component>
</template>
<style scoped>
.aven-container {
  box-sizing: border-box;
  inline-size: 100%;
  min-inline-size: 0;
}
.is-unstyled {
  padding-inline: 0 !important;
  margin-inline: 0 !important;
}
</style>

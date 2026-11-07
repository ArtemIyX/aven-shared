<script setup lang="ts">
import { computed } from 'vue'
import type { AvenUi } from './types.js'
const props = withDefaults(
  defineProps<{
    keys?: string[]
    platform?: 'auto' | 'mac' | 'windows' | 'linux'
    unstyled?: boolean
    ui?: AvenUi<'root' | 'key'>
  }>(),
  { platform: 'auto', unstyled: false },
)
const mapped = computed(() => {
  const mac =
    props.platform === 'mac' ||
    (props.platform === 'auto' &&
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad/.test(navigator.platform))
  const labels: Record<string, string> = mac
    ? {
        Alt: '⌥',
        Option: '⌥',
        Control: '⌃',
        Ctrl: '⌃',
        Meta: '⌘',
        Command: '⌘',
        Shift: '⇧',
        Enter: '↵',
        Backspace: '⌫',
        Delete: '⌦',
        Escape: 'Esc',
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
      }
    : {
        Control: 'Ctrl',
        Ctrl: 'Ctrl',
        Meta: 'Win',
        Command: 'Win',
        Alt: 'Alt',
        Option: 'Alt',
        Backspace: 'Backspace',
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
      }
  return (props.keys ?? []).map((k) => labels[k] ?? k)
})
</script>
<template>
  <kbd :class="['aven-kbd', { 'is-unstyled': unstyled }, ui?.root?.class]" :style="ui?.root?.style"
    ><template v-for="(key, index) in mapped" :key="index"
      ><span v-if="index" aria-hidden="true" class="key-separator">+</span
      ><kbd :class="['keycap', ui?.key?.class]" :style="ui?.key?.style">{{ key }}</kbd></template
    ><slot v-if="!keys?.length"
  /></kbd>
</template>
<style scoped>
.aven-kbd {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-family: var(--aven-font-family-mono);
  font-size: var(--aven-font-size-xs);
  color: var(--aven-color-text-secondary);
}
.keycap {
  display: inline-block;
  min-inline-size: 1.25em;
  padding: 0.12em 0.35em;
  border: 1px solid var(--aven-color-border-default);
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-recessed);
  text-align: center;
  box-shadow: 0 1px 0 var(--aven-color-border-subtle);
}
.key-separator {
  color: var(--aven-color-text-tertiary);
}
.is-unstyled .keycap {
  border: 0;
  background: transparent;
  box-shadow: none;
}
</style>

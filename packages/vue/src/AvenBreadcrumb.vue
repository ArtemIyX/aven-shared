<script setup lang="ts" generic="Key extends string | number">
import { computed, ref } from 'vue'
import type { AvenUi } from './types.js'
type Crumb<K> = { key: K; label: string; href?: string; current?: boolean }
const props = withDefaults(
  defineProps<{
    items: Crumb<Key>[]
    maxVisible?: number
    collapseFrom?: 'middle'
    label?: string
    unstyled?: boolean
    ui?: AvenUi<'root' | 'list' | 'item' | 'separator' | 'expand'>
  }>(),
  { collapseFrom: 'middle', label: 'Breadcrumb', unstyled: false },
)
const emit = defineEmits<{
  navigate: [payload: { key: Key; item: Crumb<Key>; originalEvent: MouseEvent }]
  expand: [payload: { originalEvent: MouseEvent }]
}>()
const expanded = ref(false),
  hidden = computed(() =>
    props.maxVisible && props.items.length > props.maxVisible
      ? props.items.slice(1, props.items.length - 1)
      : [],
  ),
  visible = computed(() =>
    !hidden.value.length || expanded.value
      ? props.items
      : [...props.items.slice(0, 1), props.items[props.items.length - 1]].filter(Boolean),
  )
function navigate(item: Crumb<Key>, e: MouseEvent) {
  if (item.href) emit('navigate', { key: item.key, item, originalEvent: e })
}
function expand(event: MouseEvent) {
  expanded.value = true
  emit('expand', { originalEvent: event })
}
</script>
<template>
  <nav
    :aria-label="label"
    :class="['aven-breadcrumb', { 'is-unstyled': unstyled }, ui?.root?.class]"
    :style="ui?.root?.style"
  >
    <ol :class="['breadcrumb-list', ui?.list?.class]" :style="ui?.list?.style">
      <template v-for="(item, index) in visible" :key="item.key"
        ><li :class="['breadcrumb-item', ui?.item?.class]" :style="ui?.item?.style">
          <a v-if="item.href && !item.current" :href="item.href" @click="navigate(item, $event)"
            ><slot name="item" :item="item" :index="items.indexOf(item)" :current="false">{{
              item.label
            }}</slot></a
          ><span
            v-else
            :aria-current="item.current || index === visible.length - 1 ? 'page' : undefined"
            ><slot
              name="item"
              :item="item"
              :index="items.indexOf(item)"
              :current="!!item.current"
              >{{ item.label }}</slot
            ></span
          >
        </li>
        <li v-if="hidden.length && index === 0 && !expanded" aria-hidden="true">
          <button
            type="button"
            :class="['breadcrumb-expand', ui?.expand?.class]"
            aria-label="Show hidden breadcrumb items"
            @click="expand"
          >
            …
          </button>
        </li>
        <li
          v-if="index < visible.length - 1"
          aria-hidden="true"
          :class="['breadcrumb-separator', ui?.separator?.class]"
        >
          <slot name="separator" :index="index">/</slot>
        </li></template
      >
    </ol>
  </nav>
</template>
<style scoped>
.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--aven-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  min-inline-size: 0;
}
.breadcrumb-item {
  min-inline-size: 0;
  color: var(--aven-color-text-secondary);
}
.breadcrumb-item a {
  color: var(--aven-color-link);
  text-decoration: none;
}
.breadcrumb-item a:hover {
  text-decoration: underline;
}
.breadcrumb-item [aria-current='page'] {
  color: var(--aven-color-text-primary);
  font-weight: 600;
}
.breadcrumb-expand {
  border: 0;
  border-radius: var(--aven-radius-sm);
  background: var(--aven-color-surface-hover);
  color: inherit;
  font: inherit;
  min-inline-size: 2rem;
  min-block-size: 2rem;
  cursor: pointer;
}
.breadcrumb-expand:focus-visible,
.breadcrumb-item a:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.breadcrumb-separator {
  color: var(--aven-color-text-tertiary);
}
.is-unstyled .breadcrumb-list {
  gap: 0;
}
</style>

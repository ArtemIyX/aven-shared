<script setup lang="ts" generic="Key extends string | number = string | number">
import { computed, shallowRef, useAttrs } from 'vue'
import type {
  AvenTimelineItem,
  AvenTimelineProps,
  AvenTimelineEvents,
  AvenTimelineSlots,
} from './types.js'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<AvenTimelineProps<Key>>(), {
  order: 'desc',
  density: 'comfortable',
  loading: false,
  hasMore: false,
  unstyled: false,
})
const emit = defineEmits<AvenTimelineEvents<Key>>()
defineSlots<AvenTimelineSlots<Key>>()
const attrs = useAttrs()
const expanded = shallowRef(new Set<Key>())
const orderedItems = computed(() =>
  [...props.items].sort((left, right) => {
    const difference = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
    return Number.isNaN(difference) ? 0 : props.order === 'desc' ? -difference : difference
  }),
)
const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: props.timeZone,
    }),
)
function timestamp(item: AvenTimelineItem<Key>) {
  const value = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)
  return Number.isNaN(value.getTime()) ? String(item.timestamp) : dateFormatter.value.format(value)
}
function toggle(item: AvenTimelineItem<Key>) {
  const next = !expanded.value.has(item.key)
  const copy = new Set(expanded.value)
  if (next) copy.add(item.key)
  else copy.delete(item.key)
  expanded.value = copy
  emit('expand', { key: item.key, expanded: next })
}
function loadMore() {
  const lastKey = orderedItems.value.at(-1)?.key
  if (lastKey !== undefined) emit('loadMore', { lastKey })
}
</script>

<template>
  <section
    v-bind="{ ...attrs, ...props.ui?.root?.attrs }"
    :class="[
      'aven-timeline',
      `is-${props.density}`,
      { 'is-loading': props.loading, 'is-unstyled': props.unstyled },
      attrs.class,
      props.ui?.root?.class,
    ]"
    :style="[attrs.style, props.ui?.root?.style]"
    :aria-busy="props.loading ? 'true' : undefined"
  >
    <slot v-if="props.loading" name="loading"
      ><p class="timeline-state" role="status">Loading activity…</p></slot
    >
    <template v-else-if="orderedItems.length">
      <ol
        v-bind="props.ui?.list?.attrs"
        class="timeline-list"
        :class="props.ui?.list?.class"
        :style="props.ui?.list?.style"
      >
        <li
          v-bind="props.ui?.item?.attrs"
          v-for="(item, index) in orderedItems"
          :key="item.key"
          class="timeline-item"
          :class="props.ui?.item?.class"
          :style="props.ui?.item?.style"
        >
          <div class="timeline-rail" aria-hidden="true">
            <span
              v-bind="props.ui?.indicator?.attrs"
              class="timeline-indicator"
              :class="[`is-${item.status ?? 'neutral'}`, props.ui?.indicator?.class]"
              :style="props.ui?.indicator?.style"
              ><slot name="indicator" :item="item">{{
                item.status === 'success' ? '✓' : ''
              }}</slot></span
            >
          </div>
          <article class="timeline-content">
            <slot name="item" :item="item" :index="index">
              <slot name="title" :item="item">{{ item.label }}</slot>
              <span v-if="item.status" class="timeline-status">{{ item.status }}</span>
              <time
                v-bind="props.ui?.timestamp?.attrs"
                class="timeline-time"
                :class="props.ui?.timestamp?.class"
                :style="props.ui?.timestamp?.style"
                :datetime="
                  item.timestamp instanceof Date ? item.timestamp.toISOString() : item.timestamp
                "
                ><slot name="timestamp" :item="item" :formatted="timestamp(item)">{{
                  timestamp(item)
                }}</slot></time
              >
              <slot v-if="item.description" name="description" :item="item"
                ><p class="timeline-description">{{ item.description }}</p></slot
              >
              <template v-if="item.details !== undefined">
                <button
                  class="details-toggle"
                  type="button"
                  :aria-expanded="expanded.has(item.key)"
                  @click="toggle(item)"
                >
                  {{ expanded.has(item.key) ? 'Hide details' : 'Show details' }}
                </button>
                <div v-if="expanded.has(item.key)" class="timeline-details">
                  <slot name="details" :item="item">{{ item.details }}</slot>
                </div>
              </template>
              <div v-if="$slots.actions" class="timeline-actions">
                <slot
                  name="actions"
                  :item="item"
                  :action="
                    (action: string, originalEvent: Event) =>
                      emit('action', { key: item.key, action, originalEvent })
                  "
                />
              </div>
            </slot>
          </article>
        </li>
      </ol>
      <slot name="footer"
        ><button v-if="props.hasMore" class="load-more" type="button" @click="loadMore">
          Load more
        </button></slot
      >
    </template>
    <slot v-else name="empty"><p class="timeline-state">No activity yet.</p></slot>
  </section>
</template>

<style scoped>
.aven-timeline {
  --aven-timeline-line: var(--aven-color-border-muted);
  --aven-timeline-dot: var(--aven-color-accent-solid);
  color: var(--aven-color-text-primary);
  min-inline-size: 0;
}
.timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.timeline-item {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr);
  gap: var(--aven-space-3);
  min-inline-size: 0;
}
.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
}
.timeline-item:not(:last-child) .timeline-rail::after {
  content: '';
  position: absolute;
  inset-block: 1.5rem 0;
  inline-size: 1px;
  background: var(--aven-timeline-line);
}
.timeline-indicator {
  z-index: 1;
  display: grid;
  place-items: center;
  inline-size: var(--aven-timeline-indicator-size, 1.25rem);
  block-size: var(--aven-timeline-indicator-size, 1.25rem);
  border: 2px solid var(--aven-timeline-dot);
  border-radius: 50%;
  background: var(--aven-color-surface-base);
  color: var(--aven-color-accent-on-solid);
  font-size: 0.7rem;
}
.timeline-indicator.is-success {
  background: var(--aven-color-feedback-success);
  border-color: var(--aven-color-feedback-success);
}
.timeline-indicator.is-warning {
  border-color: var(--aven-color-feedback-warning);
}
.timeline-indicator.is-danger {
  border-color: var(--aven-color-feedback-danger);
}
.timeline-content {
  min-inline-size: 0;
  padding-block-end: var(--aven-timeline-gap, var(--aven-space-5));
  overflow-wrap: anywhere;
}
.is-compact .timeline-content {
  padding-block-end: var(--aven-timeline-gap, var(--aven-space-3));
}
.timeline-time {
  display: block;
  margin-block-start: 0.2rem;
  color: var(--aven-color-text-secondary);
  font-size: 0.875rem;
}
.timeline-status {
  display: inline-block;
  margin-inline-start: var(--aven-space-2);
  color: var(--aven-color-text-secondary);
  font-size: 0.8125rem;
  text-transform: capitalize;
}
.timeline-description {
  margin: 0.35rem 0 0;
  color: var(--aven-color-text-secondary);
}
.details-toggle,
.load-more {
  min-block-size: 2.75rem;
  border: 0;
  padding: 0.4rem 0.65rem;
  color: var(--aven-color-link);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.details-toggle:focus-visible,
.load-more:focus-visible {
  outline: 2px solid var(--aven-color-focus-ring);
  outline-offset: 2px;
}
.timeline-details,
.timeline-actions {
  margin-block-start: var(--aven-space-2);
}
.timeline-state {
  color: var(--aven-color-text-secondary);
}
.is-unstyled {
  --aven-timeline-line: transparent;
}
@media (forced-colors: active) {
  .timeline-indicator {
    border-color: CanvasText;
  }
  .timeline-item:not(:last-child) .timeline-rail::after {
    background: CanvasText;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
@media print {
  .aven-timeline {
    color: #000;
  }
  .timeline-item:not(:last-child) .timeline-rail::after {
    background: #777;
  }
}
</style>
